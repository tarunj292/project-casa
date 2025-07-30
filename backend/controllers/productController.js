const Product = require('../models/product');
const Category = require('../models/category');
const Brand = require('../models/brand')
const mongoose = require('mongoose');

// GET all products with pagination support and exclusion
exports.getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50; // Default to 50 if no limit specified
    const skip = (page - 1) * limit;

    // Parse exclude parameter (comma-separated product IDs)
    const excludeParam = req.query.exclude;
    let excludeIds = [];

    if (excludeParam) {
      excludeIds = excludeParam.split(',').filter(id => mongoose.Types.ObjectId.isValid(id));
      console.log(`🚫 Excluding ${excludeIds.length} products:`, excludeIds.slice(0, 3), excludeIds.length > 3 ? '...' : '');
    }

    console.log(`📦 Fetching products - Page: ${page}, Limit: ${limit}, Skip: ${skip}, Excluding: ${excludeIds.length} products`);

    // Build query with exclusions
    const query = {
      is_active: true,
      ...(excludeIds.length > 0 && { _id: { $nin: excludeIds } })
    };

    const products = await Product.find(query)
      .populate('brand category')
      .skip(skip)
      .limit(limit)
      .sort({ created_at: -1 }); // Sort by newest first

    console.log(`✅ Found ${products.length} products for page ${page} (excluded ${excludeIds.length})`);

    res.json(products);
  } catch (err) {
    console.error('❌ Error fetching products:', err);
    res.status(500).json({ error: err.message });
  }
};

// GET product by ID
exports.getProductById = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid product ID' });
  }

  try {
    const product = await Product.findById(id).populate('brand category');
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET products by category (uses tag as category)
exports.getProductByCategory = async (req, res) => {
  try {
    const { category } = req.query;
    const products = await Product.find({ tags: category });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ GET all products by brand ID
exports.getAllProductsByBrand = async (req, res) => {
  try {
    const brandId = req.query.id;

    if (!brandId || !mongoose.Types.ObjectId.isValid(brandId)) {
      return res.status(400).json({ error: 'Valid brand ID is required in query (?id=...)' });
    }

    const products = await Product.find({ brand: brandId }).populate('brand category');
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
};

// GET products by price range
exports.getAllProductsByPrice = async (req, res) => {
  const { min, max } = req.query;
  try {
    const products = await Product.find({
      price: {
        $gte: min ? parseFloat(min) : 0,
        $lte: max ? parseFloat(max) : Infinity,
      },
    });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET products by gender
exports.getProductsByGender = async (req, res) => {
  try {
    const { gender } = req.query;
    const products = await Product.find({ gender });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET products by tag
exports.getProductsByTag = async (req, res) => {
  try {
    const { tag } = req.query;
    const products = await Product.find({ tags: tag });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.search = async (req, res) => {
  const { query } = req.body
  console.log(query)
  try{
    const result = await Product.find({
      name: {$regex: query, $options: "i"}
    })
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: 'Search failed' })
  }
}

exports.createProduct = async (req, res) => {
  try {
    let {
      name,
      description,
      images,
      price,
      currency,
      sizes,
      fits,
      tags,
      gender,
      brand,
      category
    } = req.body;

    // ✅ Handle dynamic brand creation
    if (typeof brand === 'object' && brand.name) {
      let existingBrand = await Brand.findOne({ name: brand.name });
      if (existingBrand) {
        brand = existingBrand._id;
      } else {
        if (!brand.logo_url) {
          return res.status(400).json({ error: 'Brand logo_url is required for new brands' });
        }
        const newBrand = await Brand.create(brand);
        brand = newBrand._id;
      }
    }

    // ✅ Handle dynamic category creation
    if (typeof category === 'object' && category.name) {
      let existingCategory = await Category.findOne({ name: category.name });
      if (existingCategory) {
        category = existingCategory._id;
      } else {
        const newCategory = await Category.create(category);
        category = newCategory._id;
      }
    }

    // ✅ Create and save the product
    const newProduct = new Product({
      name,
      description,
      images,
      price,
      currency,
      sizes,
      fits,
      tags,
      gender,
      brand,
      category
    });

    const saved = await newProduct.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

