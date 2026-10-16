/**
 * routes/products.js
 * Express routes for /api/products
 */

const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductByIdOrSlug,
  getFeaturedDeals,
  addReview
} = require('../controllers/productController.js');

// Public endpoints
router.get('/', getProducts);
router.get('/deals/featured', getFeaturedDeals);
router.get('/:idOrSlug', getProductByIdOrSlug);
router.post('/:id/reviews', addReview);

module.exports = router;
