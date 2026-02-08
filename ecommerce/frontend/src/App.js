import React, { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import ProductList from './components/ProductList';
import Cart from './components/Cart';
import Checkout from './components/Checkout';

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCheckout, setShowCheckout] = useState(false);

  useEffect(() => {
    // Fetch products from backend
    fetch('http://localhost:5000/api/products')
      .then(response => response.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching products:', error);
        setLoading(false);
      });

    // Fetch cart from backend
    fetch('http://localhost:5000/api/cart')
      .then(response => response.json())
      .then(data => setCart(data))
      .catch(error => console.error('Error fetching cart:', error));
  }, []);

  const addToCart = (productId, quantity = 1) => {
    fetch('http://localhost:5000/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, quantity })
    })
      .then(response => response.json())
      .then(data => setCart(data))
      .catch(error => console.error('Error adding to cart:', error));
  };

  const updateCartItem = (productId, quantity) => {
    fetch(`http://localhost:5000/api/cart/${productId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity })
    })
      .then(response => response.json())
      .then(data => setCart(data))
      .catch(error => console.error('Error updating cart:', error));
  };

  const removeFromCart = (productId) => {
    fetch(`http://localhost:5000/api/cart/${productId}`, {
      method: 'DELETE'
    })
      .then(response => response.json())
      .then(data => setCart(data))
      .catch(error => console.error('Error removing from cart:', error));
  };

  const getTotal = () => {
    return cart.reduce((total, item) => {
      const product = products.find(p => p.id === item.productId);
      return total + (product ? product.price * item.quantity : 0);
    }, 0);
  };

  const handleCheckout = () => {
    const total = getTotal();
    fetch('http://localhost:5000/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cart, total, paymentMethod: 'stripe' })
    })
      .then(response => response.json())
      .then(data => {
        alert('Compra realizada com sucesso!');
        setCart([]);
        setShowCheckout(false);
      })
      .catch(error => console.error('Error during checkout:', error));
  };

  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  if (loading) {
    return <div className="App flex justify-center items-center h-screen">Carregando...</div>;
  }

  return (
    <div className="App min-h-screen bg-gray-50">
      <Header cartCount={cartCount} />
      <main className="container mx-auto py-8">
        {showCheckout ? (
          <Checkout cart={cart} products={products} total={getTotal()} onCheckout={handleCheckout} onBack={() => setShowCheckout(false)} />
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1">
              <ProductList products={products} addToCart={addToCart} />
            </div>
            <div className="lg:w-1/3">
              <Cart
                cart={cart}
                products={products}
                updateCartItem={updateCartItem}
                removeFromCart={removeFromCart}
              />
              {cart.length > 0 && (
                <button
                  onClick={() => setShowCheckout(true)}
                  className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors w-full"
                >
                  Ir para Checkout
                </button>
              )}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default App;
