const Wishlist = require('../models/wishlist');
const User = require('../models/user');
const Product = require('../models/product');
const mongoose = require('mongoose');

/**
 * ENHANCED WISHLIST CONTROLLER
 * Redesigned with better error handling, validation, and features
 */

// Helper function to validate ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Helper function to find user by phone or ID
const findUser = async (identifier) => {
  if (identifier.startsWith('+') || /^\d+$/.test(identifier)) {
    return await User.findOne({ phone: identifier });
  }
  if (isValidObjectId(identifier)) {
    return await User.findById(identifier);
  }
  return null;
};

// Get user's complete wishlist
const getWishlist = async (req, res) => {
  try {
    const { phone, userId } = req.query;

    if (!phone && !userId) {
      return res.status(400).json({
        success: false,
        error: 'Phone number or user ID is required'
      });
    }

    const identifier = phone || userId;
    const user = await findUser(identifier);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const wishlist = await Wishlist.findOne({ user: user._id })
      .populate({
        path: 'items.product',
        select: 'name images price currency stock is_active brand category tags description',
        populate: [
          { path: 'brand', select: 'name logo_url' },
          { path: 'category', select: 'name image' }
        ]
      });

    if (!wishlist) {
      return res.status(200).json({
        success: true,
        message: 'Wishlist is empty',
        data: {
          user: user._id,
          items: [],
          totalItems: 0,
          totalValue: 0
        }
      });
    }

    // Filter out inactive products
    const activeItems = wishlist.items.filter(item =>
      item.product && item.product.is_active
    );

    // Calculate total value
    const totalValue = activeItems.reduce((sum, item) => {
      if (item.product && item.product.price) {
        return sum + parseFloat(item.product.price.$numberDecimal);
      }
      return sum;
    }, 0);

    res.status(200).json({
      success: true,
      message: 'Wishlist retrieved successfully',
      data: {
        _id: wishlist._id,
        user: wishlist.user,
        items: activeItems,
        totalItems: activeItems.length,
        totalValue: totalValue,
        lastModified: wishlist.lastModified,
        created_at: wishlist.created_at,
        updated_at: wishlist.updated_at
      }
    });

  } catch (error) {
    console.error('❌ Error getting wishlist:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Add product to wishlist with enhanced features
const addProduct = async (req, res) => {
  try {
    const { phone, userId, productId, priority = 'medium', notes } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        error: 'Product ID is required'
      });
    }

    if (!phone && !userId) {
      return res.status(400).json({
        success: false,
        error: 'Phone number or user ID is required'
      });
    }

    if (!isValidObjectId(productId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid product ID format'
      });
    }

    // Find user
    const identifier = phone || userId;
    const user = await findUser(identifier);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Verify product exists and is active
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    if (!product.is_active) {
      return res.status(400).json({
        success: false,
        error: 'Product is not available'
      });
    }

    // Get or create wishlist
    let wishlist = await Wishlist.getOrCreateForUser(user._id);

    // Add product with metadata
    const result = wishlist.addProduct(productId, {
      priority,
      notes,
      priceWhenAdded: product.price
    });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.message
      });
    }

    await wishlist.save();

    // Populate and return updated wishlist
    const populatedWishlist = await Wishlist.findById(wishlist._id)
      .populate({
        path: 'items.product',
        select: 'name images price currency stock is_active brand category',
        populate: [
          { path: 'brand', select: 'name logo_url' },
          { path: 'category', select: 'name image' }
        ]
      });

    console.log(`✅ Product ${product.name} added to wishlist for user ${user.phone || user._id}`);

    res.status(201).json({
      success: true,
      message: 'Product added to wishlist successfully',
      data: {
        wishlist: populatedWishlist,
        addedProduct: {
          _id: productId,
          name: product.name,
          addedAt: new Date()
        }
      }
    });

  } catch (error) {
    console.error('❌ Error adding product to wishlist:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Remove product from wishlist
const removeProduct = async (req, res) => {
  try {
    const { phone, userId, productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        error: 'Product ID is required'
      });
    }

    if (!phone && !userId) {
      return res.status(400).json({
        success: false,
        error: 'Phone number or user ID is required'
      });
    }

    if (!isValidObjectId(productId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid product ID format'
      });
    }

    // Find user
    const identifier = phone || userId;
    const user = await findUser(identifier);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Find wishlist
    const wishlist = await Wishlist.findOne({ user: user._id });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        error: 'Wishlist not found'
      });
    }

    // Remove product
    const result = wishlist.removeProduct(productId);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.message
      });
    }

    await wishlist.save();

    // Populate and return updated wishlist
    const populatedWishlist = await Wishlist.findById(wishlist._id)
      .populate({
        path: 'items.product',
        select: 'name images price currency stock is_active brand category'
      });

    console.log(`✅ Product removed from wishlist for user ${user.phone || user._id}`);

    res.status(200).json({
      success: true,
      message: 'Product removed from wishlist successfully',
      data: {
        wishlist: populatedWishlist,
        removedProductId: productId
      }
    });

  } catch (error) {
    console.error('❌ Error removing product from wishlist:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update product priority in wishlist
const updateProductPriority = async (req, res) => {
  try {
    const { phone, userId, productId, priority } = req.body;

    if (!productId || !priority) {
      return res.status(400).json({
        success: false,
        error: 'Product ID and priority are required'
      });
    }

    if (!['low', 'medium', 'high'].includes(priority)) {
      return res.status(400).json({
        success: false,
        error: 'Priority must be low, medium, or high'
      });
    }

    // Find user
    const identifier = phone || userId;
    const user = await findUser(identifier);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Find wishlist
    const wishlist = await Wishlist.findOne({ user: user._id });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        error: 'Wishlist not found'
      });
    }

    // Update priority
    const result = wishlist.updateProductPriority(productId, priority);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.message
      });
    }

    await wishlist.save();

    res.status(200).json({
      success: true,
      message: 'Product priority updated successfully',
      data: {
        productId,
        newPriority: priority
      }
    });

  } catch (error) {
    console.error('❌ Error updating product priority:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Clear entire wishlist
const clearWishlist = async (req, res) => {
  try {
    const { phone, userId } = req.body;

    if (!phone && !userId) {
      return res.status(400).json({
        success: false,
        error: 'Phone number or user ID is required'
      });
    }

    // Find user
    const identifier = phone || userId;
    const user = await findUser(identifier);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Find wishlist
    const wishlist = await Wishlist.findOne({ user: user._id });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        error: 'Wishlist not found'
      });
    }

    // Clear wishlist
    const result = wishlist.clearWishlist();
    await wishlist.save();

    console.log(`✅ Wishlist cleared for user ${user.phone || user._id}`);

    res.status(200).json({
      success: true,
      message: 'Wishlist cleared successfully',
      data: {
        clearedItems: wishlist.totalItems,
        clearedAt: new Date()
      }
    });

  } catch (error) {
    console.error('❌ Error clearing wishlist:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get wishlist statistics
const getWishlistStats = async (req, res) => {
  try {
    const { phone, userId } = req.query;

    if (!phone && !userId) {
      return res.status(400).json({
        success: false,
        error: 'Phone number or user ID is required'
      });
    }

    // Find user
    const identifier = phone || userId;
    const user = await findUser(identifier);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const wishlist = await Wishlist.findOne({ user: user._id })
      .populate('items.product', 'price currency category');

    if (!wishlist) {
      return res.status(200).json({
        success: true,
        data: {
          totalItems: 0,
          totalValue: 0,
          priorityBreakdown: { high: 0, medium: 0, low: 0 },
          categoryBreakdown: {},
          averagePrice: 0
        }
      });
    }

    // Calculate statistics
    const stats = {
      totalItems: wishlist.items.length,
      totalValue: 0,
      priorityBreakdown: { high: 0, medium: 0, low: 0 },
      categoryBreakdown: {},
      averagePrice: 0
    };

    wishlist.items.forEach(item => {
      // Priority breakdown
      stats.priorityBreakdown[item.priority]++;

      // Price calculations
      if (item.product && item.product.price) {
        const price = parseFloat(item.product.price.$numberDecimal);
        stats.totalValue += price;
      }
    });

    stats.averagePrice = stats.totalItems > 0 ? stats.totalValue / stats.totalItems : 0;

    res.status(200).json({
      success: true,
      message: 'Wishlist statistics retrieved successfully',
      data: stats
    });

  } catch (error) {
    console.error('❌ Error getting wishlist stats:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Legacy functions for backward compatibility
const userAddProduct = async (req, res) => {
  // Redirect to new addProduct function with adapted parameters
  req.body.userId = req.body.user;
  req.body.productId = req.body.product;
  return addProduct(req, res);
};

const removeProductFromWishlist = async (req, res) => {
  // Redirect to new removeProduct function with adapted parameters
  req.body.userId = req.body.user;
  req.body.productId = req.body.product;
  return removeProduct(req, res);
};

// Phone-based convenience functions
const addProductByPhone = async (req, res) => {
  return addProduct(req, res);
};

const removeProductByPhone = async (req, res) => {
  return removeProduct(req, res);
};

const getUserWishlist = async (req, res) => {
  return getWishlist(req, res);
};

module.exports = {
  // New enhanced functions
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
};
