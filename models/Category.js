/**
 * models/Category.js
 * Mongoose Schema for Product Categories (NovaMart)
 * Stored in MongoDB: ecommerce_db -> categories collection
 */

const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  icon: {
    type: String,
    default: '🛍️'
  },
  bannerImage: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  itemCount: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('Category', categorySchema);
