const Product = require('../models/product');
const Category = require('../models/category');
const Brand = require('../models/brand')
const mongoose = require('mongoose');

// GET all products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().populate('brand category');
    res.json(products);
  } catch (err) {
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

