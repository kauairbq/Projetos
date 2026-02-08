import React from 'react';

const Cart = ({ cart, products, updateCartItem, removeFromCart }) => {
  const getProductById = (id) => products.find(p => p.id === id);

  const getTotal = () => {
    return cart.reduce((total, item) => {
      const product = getProductById(item.productId);
      return total + (product ? product.price * item.quantity : 0);
    }, 0);
  };

  return (
    <div className="cart">
      <h2>Carrinho</h2>
      {cart.length === 0 ? (
        <p>O carrinho está vazio.</p>
      ) : (
        <div>
          {cart.map(item => {
            const product = getProductById(item.productId);
            if (!product) return null;
            return (
              <div key={item.productId} className="cart-item">
                <img src={product.image} alt={product.name} />
                <div>
                  <h4>{product.name}</h4>
                  <p>R$ {product.price.toFixed(2)}</p>
                  <div>
                    <button onClick={() => updateCartItem(item.productId, item.quantity - 1)} disabled={item.quantity <= 1}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateCartItem(item.productId, item.quantity + 1)}>+</button>
                  </div>
                  <button onClick={() => removeFromCart(item.productId)}>Remover</button>
                </div>
              </div>
            );
          })}
          <div className="cart-total">
            <h3>Total: R$ {getTotal().toFixed(2)}</h3>
            <button>Finalizar Compra</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
