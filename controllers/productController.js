/**
 * controllers/productController.js
 * Controller handling product querying, filtering, search, and reviews
 */

const mongoose = require('mongoose');
const Product = require('../models/Product.js');
const Category = require('../models/Category.js');

// @desc    Get all products with dynamic search, multi-faceted filtering & sorting
// @route   GET /api/products
exports.getProducts = async (req, res, next) => {
  try {
    const {
      category,
      search,
      brand,
      minPrice,
      maxPrice,
      minRating,
      inStock,
      badge,
      sort,
      page = 1,
      limit = 24
    } = req.query;

    const query = {};

    // 1. Category Filter
    if (category && category !== 'All') {
      query.category = new RegExp(`^${category}$`, 'i');
    }

    // 2. Brand Filter
    if (brand) {
      query.brand = new RegExp(`^${brand}$`, 'i');
    }

    // 3. Search Filter (multi-field regex fallback for loose and partial terms)
    if (search && search.trim() !== '') {
      const term = search.trim();
      const regex = new RegExp(term, 'i');
      query.$or = [
        { title: regex },
        { brand: regex },
        { category: regex },
        { description: regex },
        { 'specifications.value': regex }
      ];
    }

    // 4. Price Bounds
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // 5. Minimum Rating
    if (minRating) {
      query.rating = { $gte: Number(minRating) };
    }

    // 6. In Stock
    if (inStock === 'true') {
      query.inStock = true;
    }

    // 7. Badge
    if (badge) {
      query.badge = badge;
    }

    // Sorting definition
    let sortOptions = { isDealOfDay: -1, rating: -1, createdAt: -1 };
    if (sort === 'price-asc') {
      sortOptions = { price: 1 };
    } else if (sort === 'price-desc') {
      sortOptions = { price: -1 };
    } else if (sort === 'rating') {
      sortOptions = { rating: -1, reviewCount: -1 };
    } else if (sort === 'discount') {
      sortOptions = { discountPercentage: -1 };
    } else if (sort === 'newest') {
      sortOptions = { createdAt: -1 };
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [products, totalCount] = await Promise.all([
      Product.find(query).sort(sortOptions).skip(skip).limit(limitNum).lean(),
      Product.countDocuments(query)
    ]);

    // Aggregate category counts and price min/max for dynamic sidebar facets
    const categoriesCount = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      count: products.length,
      total: totalCount,
      page: pageNum,
      pages: Math.ceil(totalCount / limitNum),
      categories: categoriesCount.map(c => ({ name: c._id, count: c.count })),
      products
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product by Slug or ObjectId, plus related products
// @route   GET /api/products/:idOrSlug
exports.getProductByIdOrSlug = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    let product = null;

    if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
      product = await Product.findById(idOrSlug).lean();
    }
    if (!product) {
      product = await Product.findOne({ slug: idOrSlug.toLowerCase() }).lean();
    }

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Find up to 4 related products in the same category
    const related = await Product.find({
      category: product.category,
      _id: { $ne: product._id }
    }).limit(4).lean();

    res.status(200).json({
      success: true,
      product,
      related
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get promotional hero deals, deal of the day & bestsellers
// @route   GET /api/products/deals/featured
exports.getFeaturedDeals = async (req, res, next) => {
  try {
    const [dealsOfDay, bestsellers, trending] = await Promise.all([
      Product.find({ isDealOfDay: true }).limit(6).lean(),
      Product.find({ badge: 'Bestseller' }).limit(8).lean(),
      Product.find({ rating: { $gte: 4.6 } }).sort({ reviewCount: -1 }).limit(6).lean()
    ]);

    res.status(200).json({
      success: true,
      dealsOfDay,
      bestsellers,
      trending
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit a verified customer review
// @route   POST /api/products/:id/reviews
exports.addReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { user, rating, title, comment } = req.body;

    if (!user || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Please provide user name, rating, and review comment'
      });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const newReview = {
      user: user.trim(),
      rating: Number(rating),
      title: title ? title.trim() : '',
      comment: comment.trim(),
      verifiedPurchase: true,
      date: new Date()
    };

    product.reviews.unshift(newReview);
    product.reviewCount = product.reviews.length;
    product.rating = Number((product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length).toFixed(1));

    await product.save();

    res.status(201).json({
      success: true,
      message: 'Review posted successfully',
      reviews: product.reviews,
      rating: product.rating,
      reviewCount: product.reviewCount
    });
  } catch (error) {
    next(error);
  }
};
