/**
 * models/Poster.js
 * Mongoose schema and model for posters
 */

const mongoose = require('mongoose');

// Schema for individual poster sizes with specific pricing
const sizeSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: [true, 'Size label is required (A4, A3, A2)'],
      enum: {
        values: ['A4', 'A3', 'A2'],
        message: '{VALUE} is not a supported print size'
      }
    },
    price: {
      type: Number,
      required: [true, 'Price for size is required'],
      min: [0, 'Price must be positive']
    }
  },
  { _id: false }
);

const posterSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Poster title is required'],
    trim: true
  },
  slug: {
    type: String,
    required: [true, 'Poster slug is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Poster description is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Base price is required'],
    min: [0, 'Base price must be positive']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['Abstract', 'Botanical', 'Typography', 'Architecture', 'Landscape', 'Line Art'],
      message: '{VALUE} is not a valid category'
    }
  },
  sizes: {
    type: [sizeSchema],
    required: [true, 'At least one size option is required'],
    validate: {
      validator: function (v) {
        return Array.isArray(v) && v.length > 0;
      },
      message: 'Poster must have at least one size variant'
    }
  },
  finish: {
    type: String,
    required: [true, 'Finish is required'],
    enum: {
      values: ['matte', 'gloss laminated'],
      message: '{VALUE} is not a supported finish'
    },
    default: 'matte'
  },
  imageUrl: {
    type: String,
    required: [true, 'Image URL is required']
  },
  featured: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for performant searching and category filtering
posterSchema.index({ category: 1 });
posterSchema.index({ featured: 1 });
posterSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Poster', posterSchema);
