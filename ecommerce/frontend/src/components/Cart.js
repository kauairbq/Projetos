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
    <div className="cart p-6 bg-gray-100 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Carrinho</h2>
      {cart.length === 0 ? (
        <p>O carrinho está vazio.</p>
      ) : (
        <div>
          {cart.map(item => {
            const product = getProductById(item.productId);
            if (!product) return null;
            return (
              <div key={item.productId} className="cart-item flex items-center bg-white p-4 mb-2 rounded shadow">
                <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded mr-4" />
                <div className="flex-1">
                  <h4 className="font-semibold">{product.name}</h4>
                  <p className="text-gray-600">R$ {product.price.toFixed(2)}</p>
                  <div className="flex items-center mt-2">
                    <button
                      onClick={() => updateCartItem(item.productId, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="bg-gray-300 px-2 py-1 rounded hover:bg-gray-400 disabled:opacity-50"
                    >
                      -
                    </button>
                    <span className="mx-2">{item.quantity}</span>
                    <button
                      onClick={() => updateCartItem(item.productId, item.quantity + 1)}
                      className="bg-gray-300 px-2 py-1 rounded hover:bg-gray-400"
                    >
                      +
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => removeFromCart(item.productId)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Remover
                </button>
              </div>
            );
          })}
          <div className="cart-total mt-4 p-4 bg-white rounded shadow">
            <h3 className="text-xl font-bold">Total: R$ {getTotal().toFixed(2)}</h3>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
