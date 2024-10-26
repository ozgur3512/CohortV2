import Array "mo:base/Array";
import Hash "mo:base/Hash";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Principal "mo:base/Principal";
import Text "mo:base/Text";

actor myProject {
  // Define types
  public type Product = {
    id : Nat;
    name : Text;
    price : Nat;
    description : Text;
    imageLink : Text;
    totalStock : Int;
  };
  public type BoughtItem = {
    id : Nat;
    name : Text;
    price : Nat;
    description : Text;
    imageLink : Text;
    ownerId : Principal;
  };
  // Define variables
  private stable var nextProductId : Nat = 0;
  private var products = HashMap.HashMap<Nat, Product>(0, Nat.equal, Hash.hash);
  private var boughtItems = HashMap.HashMap<Principal, [BoughtItem]>(0, Principal.equal, Principal.hash);
  // General Functions

  public func addProduct(name : Text, price : Nat, description : Text, stock : Int, imageLink : Text) : async Product {
    let productId = nextProductId;
    let product : Product = {
      id = productId;
      name = name;
      price = price;
      description = description;
      imageLink = imageLink;
      totalStock = stock;
    };
    products.put(productId, product);
    nextProductId += 1;
    return product;
  };

  public shared (msg) func buyItem(productId : Nat) : async ?[BoughtItem] {
    if (Principal.isAnonymous(msg.caller)) return null;

    let caller : Principal = msg.caller;
    switch (products.get(productId)) {
      case null {
        return null;
      };
      case (?product) {
        if (product.totalStock <= 0) {
          return null;
        };
        let newBoughtItem : BoughtItem = {
          id = product.id;
          name = product.name;
          price = product.price;
          description = product.description;
          imageLink = product.imageLink;
          ownerId = caller;
        };

        let updatedProduct = {
          id = product.id;
          name = product.name;
          price = product.price;
          description = product.description;
          imageLink = product.imageLink;
          totalStock = product.totalStock - 1;
        };

        products.put(productId, updatedProduct);
        switch (boughtItems.get(caller)) {
          case null {
            boughtItems.put(caller, [newBoughtItem]);
            return ?[newBoughtItem];
          };
          case (?existingItems) {
            let newArray : [BoughtItem] = Array.append(existingItems, [newBoughtItem]);
            boughtItems.put(caller, newArray);
            return boughtItems.get(caller);
          };
        };
      };
    };
  };

  public func removeItem(productId : Nat) : async Bool {
    switch (products.remove(productId)) {
      case (?item) {
        nextProductId -= 1;
        return true;
      };
      case null {
        return false;
      };
    };
  };

  public func updateProduct(productId : Nat, name : Text, price : Nat, description : Text, stock : Nat, imageLink : Text) : async ?Product {
    switch (products.get(productId)) {
      case null {
        return null;
      };
      case (?product) {
        let updatedProduct = {
          id = product.id;
          name = name;
          price = price;
          description = description;
          imageLink = imageLink;
          totalStock = stock;
        };
        products.put(productId, updatedProduct);
        return ?updatedProduct;
      };

    };
  };
  // Spent hours figuring msg.caller ....
  public shared (msg) func getCaller() : async Text {
    return Principal.toText(msg.caller);
  };
  // Getters
  public query func getAllProducts() : async [Product] {
    let productIter = products.vals();
    return Iter.toArray(productIter);
  };
  public query func getProduct(id : Nat) : async ?Product {
    return products.get(id);
  };

  public shared (msg) func getBoughtItems() : async [BoughtItem] {
    if (Principal.isAnonymous(msg.caller)) return [];
    switch (boughtItems.get(msg.caller)) {
      case (?items) { return items };
      case null { return [] };
    };
  };

};
