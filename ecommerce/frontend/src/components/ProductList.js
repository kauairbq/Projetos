import React from 'react';
import ProductCard from './ProductCard';

const ProductList = ({ products, addToCart }) => {
  return (
    <div className="product-list">
      <h2 className="text-3xl font-bold mb-6">Produtos</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(product => (
          <ProductCard key={product.id} product={product} addToCart={addToCart} />
        ))}
      </div>
    </div>
  );
};

export default ProductList;
