const mongoose = require('mongoose');

// Enhanced wishlist item schema with metadata
const wishlistItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  addedAt: {
    type: Date,
    default: Date.now
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  notes: {
    type: String,
    maxlength: 500
  },
  priceWhenAdded: {
    type: mongoose.Types.Decimal128
  },
  isAvailable: {
    type: Boolean,
    default: true
  }
}, { _id: true });

// Main wishlist schema
const wishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true // One wishlist per user
  },
  items: [wishlistItemSchema],
  totalItems: {
    type: Number,
    default: 0
  },
  totalValue: {
    type: mongoose.Types.Decimal128,
    default: 0
  },
  lastModified: {
    type: Date,
    default: Date.now
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  shareToken: {
    type: String,
    unique: true,
    sparse: true // Only create index for non-null values
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
wishlistSchema.index({ user: 1 });
wishlistSchema.index({ 'items.product': 1 });
wishlistSchema.index({ shareToken: 1 });
wishlistSchema.index({ lastModified: -1 });

// Virtual for getting product count
wishlistSchema.virtual('itemCount').get(function() {
  return this.items.length;
});

// Pre-save middleware to update totalItems and lastModified
wishlistSchema.pre('save', function(next) {
  this.totalItems = this.items.length;
  this.lastModified = new Date();
  next();
});

// Method to add product with metadata
wishlistSchema.methods.addProduct = function(productId, metadata = {}) {
  const existingItem = this.items.find(item =>
    item.product.toString() === productId.toString()
  );

  if (existingItem) {
    return { success: false, message: 'Product already in wishlist' };
  }

  this.items.push({
    product: productId,
    priority: metadata.priority || 'medium',
    notes: metadata.notes || '',
    priceWhenAdded: metadata.priceWhenAdded
  });

  return { success: true, message: 'Product added to wishlist' };
};

// Method to remove product
wishlistSchema.methods.removeProduct = function(productId) {
  const initialLength = this.items.length;
  this.items = this.items.filter(item =>
    item.product.toString() !== productId.toString()
  );

  if (this.items.length === initialLength) {
    return { success: false, message: 'Product not found in wishlist' };
  }

  return { success: true, message: 'Product removed from wishlist' };
};

// Method to update product priority
wishlistSchema.methods.updateProductPriority = function(productId, priority) {
  const item = this.items.find(item =>
    item.product.toString() === productId.toString()
  );

  if (!item) {
    return { success: false, message: 'Product not found in wishlist' };
  }

  item.priority = priority;
  return { success: true, message: 'Product priority updated' };
};

// Method to clear entire wishlist
wishlistSchema.methods.clearWishlist = function() {
  this.items = [];
  this.totalValue = 0;
  return { success: true, message: 'Wishlist cleared' };
};

// Static method to find wishlist by user phone
wishlistSchema.statics.findByUserPhone = async function(phone) {
  const User = mongoose.model('User');
  const user = await User.findOne({ phone });

  if (!user) {
    return null;
  }

  return await this.findOne({ user: user._id }).populate({
    path: 'items.product',
    select: 'name images price currency stock is_active brand category'
  });
};

// Static method to create or get wishlist for user
wishlistSchema.statics.getOrCreateForUser = async function(userId) {
  let wishlist = await this.findOne({ user: userId });

  if (!wishlist) {
    wishlist = new this({ user: userId });
    await wishlist.save();
  }

  return wishlist;
};

module.exports = mongoose.model('Wishlist', wishlistSchema);