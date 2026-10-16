/**
 * server.js
 * Primary Express server entry point for "NovaMart E-Commerce"
 * Serves the modern Amazon/Flipkart-style frontend and mounts the REST API routes.
 * Fully integrated with MongoDB (ecommerce_db) & MongoDB Compass.
 */

require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/db.js');

const productRoutes = require('./routes/products.js');
const orderRoutes = require('./routes/orders.js');
const categoryRoutes = require('./routes/categories.js');

const Product = require('./models/Product.js');
const Order = require('./models/Order.js');
const Category = require('./models/Category.js');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend assets from /public directory
app.use(express.static(path.join(__dirname, 'public')));

// Clean page routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/tracking', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'order-tracking.html'));
});

app.get('/orders', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'order-tracking.html'));
});

// API Routes
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/categories', categoryRoutes);

// MongoDB Compass Live Status Endpoint
// Returns database connection status, collection document counts, and recent orders
app.get('/api/system/db-status', async (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;
  let productsCount = 0;
  let ordersCount = 0;
  let categoriesCount = 0;
  let recentOrders = [];

  if (isConnected) {
    try {
      [productsCount, ordersCount, categoriesCount, recentOrders] = await Promise.all([
        Product.countDocuments(),
        Order.countDocuments(),
        Category.countDocuments(),
        Order.find().sort({ createdAt: -1 }).limit(5).lean()
      ]);
    } catch (e) {
      console.error('Error fetching MongoDB stats:', e.message);
    }
  }

  res.status(200).json({
    status: isConnected ? 'connected' : 'disconnected',
    store: 'NovaMart E-Commerce',
    mongodb: {
      connected: isConnected,
      host: mongoose.connection.host || '127.0.0.1',
      port: mongoose.connection.port || 27017,
      database: mongoose.connection.name || 'ecommerce_db',
      compassUri: 'mongodb://localhost:27017',
      counts: {
        products: productsCount,
        orders: ordersCount,
        categories: categoriesCount
      },
      collections: ['products', 'orders', 'categories'],
      recentOrders
    },
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    store: 'NovaMart',
    timestamp: new Date().toISOString()
  });
});

// 404 handler for unmatched API routes
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'The requested API endpoint does not exist.'
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('[Unhandled Error]:', err.stack || err);
  res.status(500).json({
    success: false,
    message: 'Internal server error occurred.',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start Express server
const server = app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`[NovaMart] E-Commerce Server running at http://localhost:${PORT}`);
  console.log(`[MongoDB Compass] View DB in Compass at mongodb://localhost:27017`);
  console.log(`[Database Name] ecommerce_db`);
  console.log(`====================================================`);
});

module.exports = { app, server };
