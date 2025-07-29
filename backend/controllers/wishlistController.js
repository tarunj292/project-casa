const Wishlist = require('../models/wishlist');
const User = require('../models/user');
const Product = require('../models/product');

// add product to wishlist
const userAddProduct = async (req, res) => {
  try {
    if (!req.body || !req.body.user || !req.body.product) {
      return res.status(400).json({ error: 'Missing user or product in request body' });
    }

    const { user, product } = req.body;

    const userExists = await User.findById(user);
    const productExists = await Product.findById(product);

    if (!userExists || !productExists) {
      return res.status(404).json({ error: 'User or product not found' });
    }

    let wishlist = await Wishlist.findOne({ user });

    if (!wishlist) {
      wishlist = new Wishlist({ user, products: [product] });
    } else if (!wishlist.products.includes(product)) {
      wishlist.products.push(product);
    }

    const saved = await wishlist.save();
    const populated = await Wishlist.findById(saved._id).populate('products');

    res.status(200).json({
      message: ' Product added to wishlist',
      wishlist: populated,
    });
  } catch (err) {
    console.error(' Error adding to wishlist:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

//remove product from wishlist
const removeProductFromWishlist = async (req, res) => {
  try {
    if (!req.body || !req.body.user || !req.body.product) {
      return res.status(400).json({ error: 'Missing user or product in request body' });
    }

    const { user, product } = req.body;

    const wishlist = await Wishlist.findOne({ user });

    if (!wishlist) {
      return res.status(404).json({ error: 'Wishlist not found' });
    }

    const initialLength = wishlist.products.length;
    wishlist.products = wishlist.products.filter(p => p.toString() !== product);

    if (wishlist.products.length === initialLength) {
      return res.status(400).json({ error: 'Product not in wishlist' });
    }

    const updated = await wishlist.save();
    const populated = await Wishlist.findById(updated._id).populate('products');

    res.status(200).json({
      message: ' Product removed from wishlist',
      wishlist: populated,
    });
  } catch (err) {
    console.error(' Error removing from wishlist:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  userAddProduct,
  removeProductFromWishlist,
};
