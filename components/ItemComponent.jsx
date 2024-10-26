import React from 'react'

function ItemComponent({ items, renderButton, clickAction, removeFunction }) {
  if (items.length == 0) return (
    <h1>No item Yet</h1>
  )
  return (
    <>
      {items.map((item) => (
        <div key={item.id} className="item">
          <h3>{item.name} ( {Number(item.price)} $ )</h3>
          <img src={item.imageLink} width={80} height={80} style={{ borderRadius: 16 }} />
          <p>{item.description}</p>
          <div style={{
            display: "flex",
            flexDirection: "row",
            fontSize: 12
          }}>
            {clickAction && <p style={{
              fontWeight: "bold"
            }}>{Number(item.totalStock)} In Stock</p>}
          </div>
          {clickAction && <button onClick={() => clickAction(item)}>{renderButton}</button>}
          {removeFunction && <button onClick={() => removeFunction(item)}>Remove Item</button>}

        </div>
      ))}
    </>
  )
}

export default ItemComponent