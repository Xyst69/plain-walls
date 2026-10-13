/**
 * controllers/posterController.js
 * Controller handling poster queries: listing with filters/sort/search and single poster lookup
 */

const Poster = require('../models/Poster.js');

/**
 * @route   GET /api/posters
 * @desc    Get posters with optional category, search, sort, and featured filtering
 * @query   category - Filter by poster category (e.g. 'Abstract', 'Botanical')
 *          search   - Keyword to search in title or description
 *          sort     - 'price_asc' | 'price_desc' | 'newest' (default: newest)
 *          featured - 'true' to get only featured posters
 */
const getPosters = async (req, res) => {
  try {
    const { category, search, sort, featured } = req.query;

    const filter = {};

    // Filter by category
    if (category && category !== 'All' && category.trim() !== '') {
      filter.category = new RegExp(`^${category.trim()}$`, 'i');
    }

    // Filter by featured status if specified
    if (featured === 'true') {
      filter.featured = true;
    }

    // Search keyword in title or description
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { title: searchRegex },
        { description: searchRegex }
      ];
    }

    // Build sort options
    let sortOption = { createdAt: -1 }; // default: newest
    if (sort === 'price_asc') {
      sortOption = { price: 1 };
    } else if (sort === 'price_desc') {
      sortOption = { price: -1 };
    } else if (sort === 'newest') {
      sortOption = { createdAt: -1 };
    }

    const posters = await Poster.find(filter).sort(sortOption).lean();

    return res.status(200).json({
      success: true,
      count: posters.length,
      data: posters
    });
  } catch (error) {
    console.error('Error fetching posters:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve posters. Please try again later.'
    });
  }
};

/**
 * @route   GET /api/posters/:slug
 * @desc    Get a single poster by slug
 */
const getPosterBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    if (!slug) {
      return res.status(400).json({
        success: false,
        message: 'Poster slug is required.'
      });
    }

    const poster = await Poster.findOne({ slug: slug.toLowerCase() }).lean();

    if (!poster) {
      return res.status(404).json({
        success: false,
        message: `Poster with slug '${slug}' was not found.`
      });
    }

    return res.status(200).json({
      success: true,
      data: poster
    });
  } catch (error) {
    console.error(`Error fetching poster with slug ${req.params.slug}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve poster details.'
    });
  }
};

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

/**
 * @route   POST /api/posters
 * @desc    Create a new poster in MongoDB
 */
const createPoster = async (req, res) => {
  try {
    const { title, description, price, category, finish, imageUrl, featured, sizes } = req.body;

    if (!title || !description || price === undefined || !category) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, price, and category are required.'
      });
    }

    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice < 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be a valid positive number.'
      });
    }

    let slug = slugify(title);
    const existing = await Poster.findOne({ slug });
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const defaultSizes = Array.isArray(sizes) && sizes.length > 0 ? sizes : [
      { label: 'A4', price: numPrice },
      { label: 'A3', price: Math.round(numPrice * 1.6) },
      { label: 'A2', price: Math.round(numPrice * 2.4) }
    ];

    const poster = await Poster.create({
      title: title.trim(),
      slug,
      description: description.trim(),
      price: numPrice,
      category,
      finish: finish || 'matte',
      imageUrl: imageUrl || '/images/abstract-ochre-forms.jpg',
      featured: Boolean(featured),
      sizes: defaultSizes
    });

    return res.status(201).json({
      success: true,
      message: 'Poster saved to MongoDB successfully.',
      data: poster
    });
  } catch (error) {
    console.error('Error creating poster:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create poster in MongoDB.'
    });
  }
};

/**
 * @route   PUT /api/posters/:id
 * @desc    Update an existing poster in MongoDB
 */
const updatePoster = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, category, finish, imageUrl, featured, sizes } = req.body;

    const poster = await Poster.findById(id);
    if (!poster) {
      return res.status(404).json({
        success: false,
        message: 'Poster not found in MongoDB.'
      });
    }

    if (title) poster.title = title.trim();
    if (description) poster.description = description.trim();
    if (price !== undefined) {
      const numPrice = Number(price);
      if (!isNaN(numPrice) && numPrice >= 0) {
        poster.price = numPrice;
        if (!sizes && poster.sizes && poster.sizes.length > 0) {
          const a4 = poster.sizes.find(s => s.label === 'A4');
          if (a4) a4.price = numPrice;
          const a3 = poster.sizes.find(s => s.label === 'A3');
          if (a3) a3.price = Math.round(numPrice * 1.6);
          const a2 = poster.sizes.find(s => s.label === 'A2');
          if (a2) a2.price = Math.round(numPrice * 2.4);
        }
      }
    }
    if (category) poster.category = category;
    if (finish) poster.finish = finish;
    if (imageUrl) poster.imageUrl = imageUrl.trim();
    if (featured !== undefined) poster.featured = Boolean(featured);
    if (Array.isArray(sizes) && sizes.length > 0) poster.sizes = sizes;

    const updated = await poster.save();

    return res.status(200).json({
      success: true,
      message: 'Poster updated in MongoDB successfully.',
      data: updated
    });
  } catch (error) {
    console.error('Error updating poster:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update poster in MongoDB.'
    });
  }
};

/**
 * @route   DELETE /api/posters/:id
 * @desc    Delete a poster from MongoDB
 */
const deletePoster = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Poster.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Poster not found in MongoDB.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Poster deleted from MongoDB successfully.',
      data: deleted
    });
  } catch (error) {
    console.error('Error deleting poster:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete poster from MongoDB.'
    });
  }
};

module.exports = {
  getPosters,
  getPosterBySlug,
  createPoster,
  updatePoster,
  deletePoster
};
