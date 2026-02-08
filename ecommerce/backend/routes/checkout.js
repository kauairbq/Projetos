const express = require('express');
const pool = require('../db');
const router = express.Router();

// POST /api/checkout - Process checkout
router.post('/', async (req, res) => {
  const { cart, total, paymentMethod } = req.body;

  try {
    // Mock checkout - in real app, process payment with Stripe
    // Insert order into database
    const orderResult = await pool.query(
      'INSERT INTO orders (total, status) VALUES ($1, $2) RETURNING id',
      [total, 'completed']
    );
    const orderId = orderResult.rows[0].id;

    // Insert order items
    for (const item of cart) {
      await pool.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, (SELECT price FROM products WHERE id = $2))',
        [orderId, item.productId, item.quantity]
      );
    }

    res.json({ message: 'Checkout successful', orderId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Checkout failed' });
  }
});

module.exports = router;
