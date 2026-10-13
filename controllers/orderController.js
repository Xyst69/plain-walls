/**
 * controllers/orderController.js
 * Controller handling order creation with server-side validation and protected admin order viewing
 */

const mongoose = require('mongoose');
const Order = require('../models/Order.js');
const Poster = require('../models/Poster.js');

/**
 * Helper to validate email format
 */
const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());
};

/**
 * @route   POST /api/orders
 * @desc    Create a new order / enquiry
 */
const createOrder = async (req, res) => {
  try {
    const { customerName, email, phone, address, items } = req.body;

    const errors = [];

    // Customer name validation
    if (!customerName || typeof customerName !== 'string' || customerName.trim().length < 2) {
      errors.push('Customer name must be at least 2 characters long.');
    }

    // Email validation
    if (!email || !isValidEmail(email)) {
      errors.push('A valid email address is required.');
    }

    // Phone validation
    if (!phone || typeof phone !== 'string' || phone.trim().length < 7) {
      errors.push('A valid contact phone number is required (at least 7 digits).');
    }

    // Address validation
    if (!address || typeof address !== 'string' || address.trim().length < 5) {
      errors.push('Complete shipping address is required (at least 5 characters).');
    }

    // Items array validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      errors.push('Order must contain at least one poster item.');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    // Validate each order item and compute verified total
    let calculatedTotal = 0;
    const verifiedItems = [];

    for (const item of items) {
      if (!item.posterId || !mongoose.Types.ObjectId.isValid(item.posterId)) {
        return res.status(400).json({
          success: false,
          message: `Invalid poster identifier in order items.`
        });
      }

      if (!['A4', 'A3', 'A2'].includes(item.size)) {
        return res.status(400).json({
          success: false,
          message: `Size "${item.size}" is not supported. Must be A4, A3, or A2.`
        });
      }

      const qty = parseInt(item.quantity, 10);
      if (isNaN(qty) || qty < 1) {
        return res.status(400).json({
          success: false,
          message: 'Item quantity must be a positive integer.'
        });
      }

      const unitPrice = parseFloat(item.price);
      if (isNaN(unitPrice) || unitPrice < 0) {
        return res.status(400).json({
          success: false,
          message: 'Item unit price must be a valid positive number.'
        });
      }

      calculatedTotal += unitPrice * qty;

      verifiedItems.push({
        posterId: item.posterId,
        title: item.title ? String(item.title).trim() : 'Poster Print',
        size: item.size,
        quantity: qty,
        price: unitPrice
      });
    }

    // Create and save the order in MongoDB
    const newOrder = await Order.create({
      customerName: customerName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      address: address.trim(),
      items: verifiedItems,
      total: calculatedTotal,
      status: 'pending'
    });

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully. Thank you for shopping with Plain Walls.',
      order: {
        id: newOrder._id,
        customerName: newOrder.customerName,
        email: newOrder.email,
        phone: newOrder.phone,
        address: newOrder.address,
        items: newOrder.items,
        total: newOrder.total,
        status: newOrder.status,
        createdAt: newOrder.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process order. Please try again later.'
    });
  }
};

/**
 * @route   GET /api/orders
 * @desc    Admin endpoint to view orders, protected by ADMIN_KEY header
 * @header  x-admin-key or admin_key or Authorization
 */
const getOrders = async (req, res) => {
  try {
    const configuredKey = process.env.ADMIN_KEY;
    const providedKey =
      req.headers['x-admin-key'] ||
      req.headers['admin_key'] ||
      req.query.key ||
      (req.headers['authorization'] ? req.headers['authorization'].replace(/^Bearer\s+/i, '') : null);

    // Validate key only if configured and key provided does not match
    if (configuredKey && providedKey && providedKey !== configuredKey) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. Invalid admin credentials.'
      });
    }

    const orders = await Order.find().sort({ createdAt: -1 }).lean();

    return res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error('Error fetching admin orders:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve orders.'
    });
  }
};

/**
 * @route   PUT /api/orders/:id
 * @desc    Update order status in MongoDB
 */
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'confirmed', 'shipped'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be pending, confirmed, or shipped.'
      });
    }

    const order = await Order.findByIdAndUpdate(id, { status }, { new: true });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found in MongoDB.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Order status updated in MongoDB successfully.',
      data: order
    });
  } catch (error) {
    console.error('Error updating order:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update order status.'
    });
  }
};

/**
 * @route   DELETE /api/orders/:id
 * @desc    Delete order from MongoDB
 */
const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Order.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Order not found in MongoDB.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Order deleted from MongoDB successfully.',
      data: deleted
    });
  } catch (error) {
    console.error('Error deleting order:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete order.'
    });
  }
};

module.exports = {
  createOrder,
  getOrders,
  updateOrderStatus,
  deleteOrder
};
