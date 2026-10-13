/**
 * routes/posters.js
 * Express router for poster resources
 */

const express = require('express');
const router = express.Router();
const {
  getPosters,
  getPosterBySlug,
  createPoster,
  updatePoster,
  deletePoster
} = require('../controllers/posterController.js');

// GET /api/posters - List posters with query filters (category, search, sort, featured)
router.get('/', getPosters);

// GET /api/posters/:slug - Retrieve single poster by unique slug
router.get('/:slug', getPosterBySlug);

// POST /api/posters - Create new poster in MongoDB
router.post('/', createPoster);

// PUT /api/posters/:id - Update existing poster in MongoDB
router.put('/:id', updatePoster);

// DELETE /api/posters/:id - Delete poster from MongoDB
router.delete('/:id', deletePoster);

module.exports = router;
