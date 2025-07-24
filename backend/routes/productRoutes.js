const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Get product by ID
router.get('/:id', productController.getProductById);

// Get products by category (tag used as category)
router.get('/category', productController.getProductByCategory);

// Get all products by brand
router.get('/brand', productController.getAllProductsByBrand);

// Get all products by gender
router.get('/gender', productController.getProductsByGender);

// Get products by tag
router.get('/tag', productController.getProductsByTag);

// Get products by price range using query params ?min=100&max=1000
router.get('/price', productController.getAllProductsByPrice);

module.exports = router;
