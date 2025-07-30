// backend/routes/wishlistRoutes.js

const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');

// Add product to wishlist
router.post('/add', wishlistController.userAddProduct);

// Remove product from wishlist
router.post('/remove', wishlistController.removeProductFromWishlist);

module.exports = router;
