import React from 'react';

const ProductList = ({ products, addToCart }) => {
  return (
    <div className="product-list">
      <h2>Produtos</h2>
      <div className="products">
        {products.map(product => (
          <div key={product.id} className="product-card">
            <img src={product.image} alt={product.name} />
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <p className="price">R$ {product.price.toFixed(2)}</p>
            <button onClick={() => addToCart(product.id)}>Adicionar ao Carrinho</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;
