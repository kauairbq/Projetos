import React from 'react';

const ProductCard = ({ product, addToCart }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-4 m-2 transition-transform hover:scale-105">
      <img src={product.image} alt={product.name} className="w-full h-48 object-cover rounded" />
      <h3 className="text-lg font-semibold mt-2">{product.name}</h3>
      <p className="text-gray-600">{product.description}</p>
      <p className="text-xl font-bold text-blue-600 mt-2">R$ {product.price.toFixed(2)}</p>
      <button
        onClick={() => addToCart(product.id)}
        className="bg-blue-600 text-white px-4 py-2 rounded mt-2 hover:bg-blue-700 transition-colors"
      >
        Adicionar ao Carrinho
      </button>
    </div>
  );
};

export default ProductCard;
