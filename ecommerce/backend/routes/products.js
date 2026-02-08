const express = require('express');
const router = express.Router();

// Sample products data (in-memory for now, since DB is not set up)
const products = [
  { id: 1, name: 'Produto 1', price: 29.99, description: 'Descrição do produto 1', image: 'https://via.placeholder.com/150' },
  { id: 2, name: 'Produto 2', price: 49.99, description: 'Descrição do produto 2', image: 'https://via.placeholder.com/150' },
  { id: 3, name: 'Produto 3', price: 19.99, description: 'Descrição do produto 3', image: 'https://via.placeholder.com/150' },
  { id: 4, name: 'Produto 4', price: 99.99, description: 'Descrição do produto 4', image: 'https://via.placeholder.com/150' },
];

// GET /api/products - Get all products
router.get('/', (req, res) => {
  try {
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao buscar produtos' });
  }
});

// GET /api/products/:id - Get a single product by ID
router.get('/:id', (req, res) => {
  try {
    const product = products.find(p => p.id === parseInt(req.params.id));
    if (!product) return res.status(404).json({ message: 'Produto não encontrado' });
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao buscar produto' });
  }
});

module.exports = router;
