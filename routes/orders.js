/**
 * routes/orders.js
 * Express router for customer orders and admin order inspection
 */

const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrders,
  updateOrderStatus,
  deleteOrder
} = require('../controllers/orderController.js');

// POST /api/orders - Submit customer checkout enquiry/order
router.post('/', createOrder);

// GET /api/orders - Administrative order list
router.get('/', getOrders);

// PUT /api/orders/:id - Update order status in MongoDB
router.put('/:id', updateOrderStatus);

// DELETE /api/orders/:id - Delete order from MongoDB
router.delete('/:id', deleteOrder);

module.exports = router;
