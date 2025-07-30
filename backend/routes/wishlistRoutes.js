const express = require('express');
const router = express.Router();
const {
  // Enhanced functions
  getWishlist,
  addProduct,
  removeProduct,
  updateProductPriority,
  clearWishlist,
  getWishlistStats,

  // Legacy functions (backward compatibility)
  userAddProduct,
  removeProductFromWishlist,

  // Phone-based functions
  addProductByPhone,
  removeProductByPhone,
  getUserWishlist
} = require('../controllers/wishlistController');

/**
 * ENHANCED WISHLIST ROUTES
 * Redesigned with RESTful patterns and better organization
 */

// === MAIN WISHLIST ROUTES ===

// Get wishlist (supports both phone and userId)
// GET /api/wishlist?phone=+919876543210 OR ?userId=64b5f301a4892f96f1c9be4d
router.get('/', getWishlist);

// Get wishlist statistics
// GET /api/wishlist/stats?phone=+919876543210
router.get('/stats', getWishlistStats);

// Add product to wishlist
// POST /api/wishlist/items
// Body: { phone: "+919876543210", productId: "64b5f301...", priority: "high", notes: "..." }
router.post('/items', addProduct);

// Remove product from wishlist
// DELETE /api/wishlist/items
// Body: { phone: "+919876543210", productId: "64b5f301..." }
router.delete('/items', removeProduct);

// Update product priority
// PATCH /api/wishlist/items/priority
// Body: { phone: "+919876543210", productId: "64b5f301...", priority: "high" }
router.patch('/items/priority', updateProductPriority);

// Clear entire wishlist
// DELETE /api/wishlist/clear
// Body: { phone: "+919876543210" }
router.delete('/clear', clearWishlist);

// === LEGACY ROUTES (Backward Compatibility) ===

// Original routes (using user ID)
router.post('/add', userAddProduct);
router.put('/remove', removeProductFromWishlist);

// === PHONE-BASED CONVENIENCE ROUTES ===

// Phone-based routes (for easier frontend integration)
router.get('/by-phone', getUserWishlist); // GET /api/wishlist/by-phone?phone=+919876543210
router.post('/add-by-phone', addProductByPhone);
router.delete('/remove-by-phone', removeProductByPhone);

module.exports = router;
