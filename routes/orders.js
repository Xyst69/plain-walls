/**
 * routes/orders.js
 * Express routes for /api/orders
 */

const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrderDetails,
  getAllOrders,
  updateOrderStatus
} = require('../controllers/orderController.js');

// Order routes
router.post('/', createOrder);
router.get('/', getAllOrders);
router.get('/:orderNumber', getOrderDetails);
router.put('/:orderNumber/status', updateOrderStatus);

module.exports = router;
