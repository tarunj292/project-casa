const Product = require('../models/product');

// GET product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET product by category (assuming tags act as categories)
exports.getProductByCategory = async (req, res) => {
  try {
    const products = await Product.find({ tags: req.body.category });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET all products by category
exports.getAllProductsByCategory = async (req, res) => {
  try {
    const products = await Product.find({ tags: req.body.category });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET all products by brand
exports.getAllProductsByBrand = async (req, res) => {
  try {
    const products = await Product.find({ brand_id: req.body.brandId });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET all products by price (e.g., under 1000 or between range)
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
    const products = await Product.find({ gender: req.body.gender });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET products by tag
exports.getProductsByTag = async (req, res) => {
  try {
    const products = await Product.find({ tags: req.body.tag });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
