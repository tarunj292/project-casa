const mongoose = require('mongoose');
const product = require('./product');

const wishlistSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      }]
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });
module.exports = mongoose.model('Wishlist', wishlistSchema);