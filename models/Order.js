/**
 * models/Order.js
 * Mongoose Schema for Customer Orders (NovaMart)
 * Stored in MongoDB: ecommerce_db -> orders collection
 * Visible in MongoDB Compass!
 */

const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  title: { type: String, required: true },
  brand: { type: String, default: '' },
  image: { type: String, default: '' },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  variant: { type: String, default: '' },
  itemTotal: { type: Number, required: true }
}, { _id: false });

const customerSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  phone: { type: String, required: true, trim: true },
  address: { type: String, required: true, trim: true },
  city: { type: String, required: true, trim: true },
  state: { type: String, required: true, trim: true },
  pincode: { type: String, required: true, trim: true }
}, { _id: false });

const orderPricingSchema = new mongoose.Schema({
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  couponCode: { type: String, default: '' },
  deliveryFee: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true }
}, { _id: false });

const trackingStepSchema = new mongoose.Schema({
  status: { type: String, required: true },
  label: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  done: { type: Boolean, default: false }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  customer: {
    type: customerSchema,
    required: true
  },
  items: {
    type: [orderItemSchema],
    required: true,
    validate: [val => val.length > 0, 'An order must contain at least one item']
  },
  pricing: {
    type: orderPricingSchema,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['cod', 'upi', 'card'],
    default: 'cod'
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed'],
    default: 'Pending'
  },
  orderStatus: {
    type: String,
    enum: ['Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Confirmed'
  },
  estimatedDeliveryDate: {
    type: Date,
    default: () => new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days from now
  },
  trackingTimeline: [trackingStepSchema],
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

module.exports = mongoose.model('Order', orderSchema);
