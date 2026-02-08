const express = require('express');
const cors = require('cors');
const productsRouter = require('./routes/products');
const cartRouter = require('./routes/cart');
const checkoutRouter = require('./routes/checkout');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/products', productsRouter);
app.use('/api/cart', cartRouter);
app.use('/api/checkout', checkoutRouter);

// Default route
app.get('/', (req, res) => {
  res.send('Ecommerce Backend API');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
