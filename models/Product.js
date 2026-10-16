/**
 * models/Product.js
 * Mongoose Schema for E-Commerce Products (NovaMart)
 * Stored in MongoDB: ecommerce_db -> products collection
 */

const mongoose = require('mongoose');

const specificationSchema = new mongoose.Schema({
  label: { type: String, required: true },
  value: { type: String, required: true }
}, { _id: false });

const variantSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g. "Color", "Storage", "Size"
  options: [{ type: String, required: true }] // e.g. ["Midnight Black", "Platinum Silver"]
}, { _id: false });

const reviewSchema = new mongoose.Schema({
  user: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String, default: '' },
  comment: { type: String, required: true },
  verifiedPurchase: { type: Boolean, default: true },
  date: { type: Date, default: Date.now }
}, { _id: true });

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Product title is required'],
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  brand: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  category: {
    type: String,
    required: true,
    index: true
  },
  price: {
    type: Number,
    required: [true, 'Product selling price is required'],
    min: 0
  },
  originalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  discountPercentage: {
    type: Number,
    default: function() {
      if (this.originalPrice && this.price && this.originalPrice > this.price) {
        return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
      }
      return 0;
    }
  },
  rating: {
    type: Number,
    default: 4.5,
    min: 1,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 85
  },
  inStock: {
    type: Boolean,
    default: true
  },
  stock: {
    type: Number,
    default: 20,
    min: 0
  },
  badge: {
    type: String,
    enum: ['Bestseller', 'Deal of the Day', 'Top Rated', "Amazon's Choice", 'Trending', 'New Launch', ''],
    default: ''
  },
  images: {
    type: [String],
    default: []
  },
  description: {
    type: String,
    required: true
  },
  highlights: {
    type: [String],
    default: []
  },
  specifications: [specificationSchema],
  variants: [variantSchema],
  reviews: [reviewSchema],
  isDealOfDay: {
    type: Boolean,
    default: false,
    index: true
  },
  isFeatured: {
    type: Boolean,
    default: false,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Text index for fast multi-field search (title, brand, description, category)
productSchema.index({ title: 'text', brand: 'text', description: 'text', category: 'text' });

module.exports = mongoose.model('Product', productSchema);
