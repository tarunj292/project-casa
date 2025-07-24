// models/product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  images: {
    type: [String],
    default: [],
  },
  price: {
    type: mongoose.Types.Decimal128,
    required: true,
  },
  currency: {
    type: String,
    default: 'INR',
  },
  sizes: {
    type: [String],
    default: [],
  },
  fits: {
    type: [String],
    default: [],
  },
  tags: {
    type: [String],
    default: [],
  },
  stock: {
    type: Number,
    default: 0,
  },
  is_active: {
    type: Boolean,
    default: true,
  },
  geo_tags: {
    type: [String],
    default: [],
  },
  gender: {
    type: String,
    enum: []
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('Product', productSchema);
