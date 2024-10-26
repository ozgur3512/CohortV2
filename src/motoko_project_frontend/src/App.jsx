import { useEffect, useState } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { motoko_project_backend } from 'declarations/motoko_project_backend';
import ItemComponent from '../../../components/ItemComponent';
import { createActor } from '../../declarations/motoko_project_backend/index.js';
import { HttpAgent } from '@dfinity/agent';

function App() {
  const [authClient, setAuthClient] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [identity, setIdentity] = useState(null);
  const [view, setView] = useState('customer');
  const [boughtItems, setBoughtItems] = useState([]);
  const [items, setItems] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [editPopup, setEditPopup] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: 0,
    description: '',
    stock: 0,
    imageLink: ''
  });


  const getBoughtItems = async () => {
    const agent = new HttpAgent({ identity });
    const authenticatedActor = createActor("bd3sg-teaaa-aaaaa-qaaba-cai", { agent });
    const boughtItems = await authenticatedActor.getBoughtItems();
    setBoughtItems(boughtItems);
  };
  useEffect(() => {
    getBoughtItems()
  }, [identity])

  useEffect(() => {
    async function initAuthClient() {
      const client = await AuthClient.create();
      setAuthClient(client);
      if (await client.isAuthenticated()) {
        setIsAuthenticated(true);
        setIdentity(client.getIdentity());
      }
    }
    motoko_project_backend.getAllProducts().then((result) => {
      setItems(result);
    });


    initAuthClient();
  }, []);


  const editItem = (item) => {
    setCurrentItem(item);
    setEditPopup(true);
  };

  async function handleLogin() {
    await authClient.login({
      identityProvider: 'http://bkyz2-fmaaa-aaaaa-qaaaq-cai.localhost:4943/',
      onSuccess: () => {
        setIsAuthenticated(true);
        setIdentity(authClient.getIdentity());
      },
    });
  }

  function handleLogout() {
    authClient.logout();
    setIsAuthenticated(false);
    setIdentity(null);
  }


  const buyItem = async (item) => {
    const itemId = Number(item.id);
    const agent = new HttpAgent({ identity });
    const authenticatedActor = createActor("bd3sg-teaaa-aaaaa-qaaba-cai", { agent });
    const boughtItems = await authenticatedActor.buyItem(itemId);
    setBoughtItems(boughtItems);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentItem({
      ...currentItem,
      [name]: value
    });
  };
  const updateItem = async () => {
    const { id, name, price, description, stock, imageLink } = currentItem;
    const updatedItem = await motoko_project_backend.updateProduct(id, name, parseInt(price), description, parseInt(stock), imageLink);
    setItems(items.map(item => item.id === id ? updatedItem[0] : item));
    setEditPopup(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct({
      ...newProduct,
      [name]: value
    });
  };

  const handleAddProduct = async () => {
    const { name, price, description, stock, imageLink } = newProduct;
    const addedProduct = await motoko_project_backend.addProduct(name, parseInt(price), description, parseInt(stock), imageLink);
    setItems([...items, addedProduct]);
    setShowPopup(false);
    setNewProduct({ name: '', price: 0, description: '', stock: 0, imageLink: '' });

  };
  const deleteProduct = async (item) => {
    const itemId = Number(item.id)
    await motoko_project_backend.removeItem(itemId);
    setItems(items.filter(x => Number(x.id) != itemId));
  };


  return (
    <div>
      <div className='space'></div>
      <main>
        <header style={{
          marginBottom: 12,
        }}>
          {!isAuthenticated ? (
            <button onClick={handleLogin}>Login To Save Items</button>
          ) : (
            <button onClick={handleLogout}>Logout </button>
          )}
        </header>
        <>
          <div className='header-section'>
            <button
              onClick={() => setView('customer')}
              className={`toggle-btn ${view === 'customer' ? 'active' : ''}`}
            >
              Customer
            </button>
            <button
              onClick={() => setView('seller')}
              className={`toggle-btn ${view === 'seller' ? 'active' : ''}`}
            >
              Seller
            </button>
            {boughtItems.length != 0 && <button
              onClick={() => setView('boughtItems')}
              className={`toggle-btn ${view === 'boughtItems' ? 'active' : ''}`}
            >
              Bought Items
            </button>}
          </div>

          <div className='horizontalLine'></div>
          {view === 'customer' && (
            <section id="customer-section">
              <div className='titleBackground'>
                <h1>Available Items</h1>
              </div>
              <div id="items-list">
                <ItemComponent items={items} renderButton={"Buy Item"} clickAction={buyItem} />
              </div>
            </section>
          )}
          {view === 'seller' && (
            <section id="customer-section">
              <div className='titleBackground'>
                <h1>Manage Items</h1>
              </div>
              <div id="seller-items-list">
                <ItemComponent items={items} renderButton={"Edit Item"} clickAction={editItem} removeFunction={deleteProduct} />
              </div>
              <button id="add-new-item" onClick={() => setShowPopup(true)}>Add New Item</button>
            </section>
          )}

          {view === 'boughtItems' && (
            <section id="customer-section">
              <div className='titleBackground'>
                <h1>Past Items</h1>
              </div>
              <div id="bought-items-list">
                <ItemComponent items={boughtItems} />
              </div>
            </section>
          )}


          {showPopup && (
            <div className="popup">
              <div className="popup-inner">
                <form>
                  <label>
                    Name:
                    <input type="text" name="name" value={newProduct.name} onChange={handleInputChange} />
                  </label>
                  <label>
                    Price:
                    <input type="number" name="price" value={newProduct.price} onChange={handleInputChange} />
                  </label>
                  <label>
                    Description:
                    <textarea name="description" value={newProduct.description} onChange={handleInputChange} />
                  </label>
                  <label>
                    Stock:
                    <input type="number" name="stock" value={newProduct.stock} onChange={handleInputChange} />
                  </label>
                  <label>
                    Image Link:
                    <input type="text" name="imageLink" value={newProduct.imageLink} onChange={handleInputChange} />
                  </label>
                </form>
                <button onClick={handleAddProduct}>Add Product</button>
                <button onClick={() => {
                  setShowPopup(false);
                }}>Close</button>
              </div>
            </div>
          )}
          {editPopup && (
            <div className="popup">
              <div className="popup-inner">
                <h2>Edit Item</h2>
                <form>
                  <label>
                    Name:
                    <input type="text" name="name" value={currentItem.name} onChange={handleEditInputChange} />
                  </label>
                  <label>
                    Price:
                    <input type="number" name="price" value={currentItem.price} onChange={handleEditInputChange} />
                  </label>
                  <label>
                    Description:
                    <textarea name="description" value={currentItem.description} onChange={handleEditInputChange} />
                  </label>
                  <label>
                    Stock:
                    <input type="number" name="stock" value={currentItem.stock} onChange={handleEditInputChange} />
                  </label>
                  <label>
                    Image Link:
                    <input type="text" name="imageLink" value={currentItem.imageLink} onChange={handleEditInputChange} />
                  </label>
                </form>
                <button onClick={updateItem}>Save Changes</button>
                <button onClick={() => setEditPopup(false)}>Cancel</button>
              </div>
            </div>
          )}

        </>
      </main>
    </div >
  );
}

export default App;
