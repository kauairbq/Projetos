import React, { useState, useEffect } from 'react';
import './App.css';
import ProductList from './components/ProductList';
import Cart from './components/Cart';

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch products from backend
    fetch('/api/products')
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
    fetch('/api/cart')
      .then(response => response.json())
      .then(data => setCart(data))
      .catch(error => console.error('Error fetching cart:', error));
  }, []);

  const addToCart = (productId, quantity = 1) => {
    fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, quantity })
    })
      .then(response => response.json())
      .then(data => setCart(data))
      .catch(error => console.error('Error adding to cart:', error));
  };

  const updateCartItem = (productId, quantity) => {
    fetch(`/api/cart/${productId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity })
    })
      .then(response => response.json())
      .then(data => setCart(data))
      .catch(error => console.error('Error updating cart:', error));
  };

  const removeFromCart = (productId) => {
    fetch(`/api/cart/${productId}`, {
      method: 'DELETE'
    })
      .then(response => response.json())
      .then(data => setCart(data))
      .catch(error => console.error('Error removing from cart:', error));
  };

  if (loading) {
    return <div className="App">Carregando...</div>;
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Ecommerce App</h1>
      </header>
      <main>
        <ProductList products={products} addToCart={addToCart} />
        <Cart cart={cart} products={products} updateCartItem={updateCartItem} removeFromCart={removeFromCart} />
      </main>
    </div>
  );
}

export default App;
