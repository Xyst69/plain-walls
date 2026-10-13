/**
 * models/Order.js
 * Mongoose schema and model for customer orders / checkout enquiries
 */

const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    posterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Poster',
      required: [true, 'Poster ID is required']
    },
    title: {
      type: String,
      required: [true, 'Poster title is required'],
      trim: true
    },
    size: {
      type: String,
      required: [true, 'Size is required (A4, A3, A2)'],
      enum: ['A4', 'A3', 'A2']
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1']
    },
    price: {
      type: Number,
      required: [true, 'Unit price is required'],
      min: [0, 'Unit price must be positive']
    }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Customer email is required'],
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  phone: {
    type: String,
    required: [true, 'Contact phone number is required'],
    trim: true
  },
  address: {
    type: String,
    required: [true, 'Shipping address is required'],
    trim: true
  },
  items: {
    type: [orderItemSchema],
    required: [true, 'Order must contain at least one item'],
    validate: {
      validator: function (v) {
        return Array.isArray(v) && v.length > 0;
      },
      message: 'Order items cannot be empty'
    }
  },
  total: {
    type: Number,
    required: [true, 'Total order amount is required'],
    min: [0, 'Total must be positive']
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'confirmed', 'shipped'],
      message: '{VALUE} is not a valid order status'
    },
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', orderSchema);
