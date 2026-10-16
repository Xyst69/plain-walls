/**
 * routes/categories.js
 * Express routes for /api/categories
 */

const express = require('express');
const router = express.Router();
const Category = require('../models/Category.js');
const Product = require('../models/Product.js');

// @desc    Get all categories with dynamic live product counts
// @route   GET /api/categories
router.get('/', async (req, res, next) => {
  try {
    const categories = await Category.find().lean();
    
    // Compute dynamic count from Product collection
    const counts = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    const countMap = {};
    counts.forEach(c => { countMap[c._id] = c.count; });

    const categoriesWithCount = categories.map(cat => ({
      ...cat,
      itemCount: countMap[cat.name] || cat.itemCount || 0
    }));

    res.status(200).json({
      success: true,
      count: categoriesWithCount.length,
      categories: categoriesWithCount
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
