/**
 * server.js
 * Primary Express server entry point for "Plain Walls"
 * Serves the static editorial gallery frontend and mounts the REST API routes.
 */

require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db.js');

const posterRoutes = require('./routes/posters.js');
const orderRoutes = require('./routes/orders.js');
const enquiryRoutes = require('./routes/enquiries.js');

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

const mongoose = require('mongoose');
const Poster = require('./models/Poster.js');
const Order = require('./models/Order.js');

// Clean page route helpers for editorial browsing
app.get('/shop', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'shop.html'));
});

app.get('/poster/:slug', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'poster.html'));
});

app.get('/cart', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'cart.html'));
});

app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'about.html'));
});

// API Routes
app.use('/api/posters', posterRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/enquiries', enquiryRoutes);

// Database status & Health check endpoint
app.get('/api/health', async (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;
  let postersCount = 0;
  let ordersCount = 0;

  if (isConnected) {
    try {
      postersCount = await Poster.countDocuments();
      ordersCount = await Order.countDocuments();
    } catch (e) {
      console.error('Error querying counts for health:', e.message);
    }
  }

  res.status(200).json({
    status: isConnected ? 'ok' : 'degraded',
    store: 'Plain Walls',
    mongodb: {
      connected: isConnected,
      host: mongoose.connection.host || '127.0.0.1',
      port: mongoose.connection.port || 27017,
      database: mongoose.connection.name || 'plain_walls',
      compassUri: 'mongodb://localhost:27017',
      counts: {
        posters: postersCount,
        orders: ordersCount
      }
    },
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
  console.log(`[Plain Walls] Server is running at http://localhost:${PORT}`);
});

module.exports = { app, server };
