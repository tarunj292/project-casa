const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
// require('../models/brand');     // ✅ registers Brand schema
// require('../models/category');  // ✅ registers Category schema (if needed)


// ✅ Add this first
router.get('/', productController.getAllProducts);

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

// Get product by ID
router.get('/:id', productController.getProductById);

// creates a new product 
router.post('/', productController.createProduct);

module.exports = router;



//Option 1: Use an existing brand ID (preferred)
// Make sure you use the _id of an already existing brand in your database. Example:
// "brand": "64b5f301a4892f96f1c9be4d" // existing brand ObjectId


// Option 2: If you're creating a new brand in the POST logic, update the request body to include logo_url:
// "brand": {
//   "name": "Street Hoodie",
//   "logo_url": "https://dummyimage.com/100x100/000/fff.png&text=SH"
