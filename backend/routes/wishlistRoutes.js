const express = require('express');
const router = express.Router();
const {
  userAddProduct,
  removeProductFromWishlist
} = require('../controllers/wishlistController');

router.post('/add', userAddProduct);
router.put('/remove', removeProductFromWishlist);

module.exports = router;
