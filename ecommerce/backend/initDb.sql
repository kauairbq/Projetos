-- Create database
CREATE DATABASE ecommerce_db;

-- Connect to database
\c ecommerce_db;

-- Create users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create products table
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  description TEXT,
  image VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create orders table
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  total DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create order_items table
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id),
  product_id INTEGER REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL
);

-- Insert sample products
INSERT INTO products (name, price, description, image) VALUES
('Produto 1', 29.99, 'Descrição do produto 1', 'https://via.placeholder.com/150'),
('Produto 2', 49.99, 'Descrição do produto 2', 'https://via.placeholder.com/150'),
('Produto 3', 19.99, 'Descrição do produto 3', 'https://via.placeholder.com/150'),
('Produto 4', 99.99, 'Descrição do produto 4', 'https://via.placeholder.com/150');
