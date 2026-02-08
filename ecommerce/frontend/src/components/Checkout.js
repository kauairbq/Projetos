import React, { useState } from 'react';

const Checkout = ({ cart, products, total, onCheckout, onBack }) => {
  const [paymentMethod, setPaymentMethod] = useState('stripe');

  const handleCheckout = () => {
    onCheckout();
  };

  return (
    <div className="checkout bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Checkout</h2>
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Itens no Carrinho:</h3>
        {cart.map(item => {
          const product = products.find(p => p.id === item.productId);
          return (
            <div key={item.productId} className="flex justify-between py-2">
              <span>{product.name} x {item.quantity}</span>
              <span>R$ {(product.price * item.quantity).toFixed(2)}</span>
            </div>
          );
        })}
        <div className="border-t pt-2 mt-2">
          <strong>Total: R$ {total.toFixed(2)}</strong>
        </div>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Método de Pagamento:</label>
        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="stripe">Stripe (Sandbox)</option>
          <option value="paypal">PayPal</option>
        </select>
      </div>
      <button
        onClick={handleCheckout}
        className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition-colors"
      >
        Finalizar Compra
      </button>
    </div>
  );
};

export default Checkout;
