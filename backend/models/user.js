const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, sparse: true,  match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'] },
  phone: { type: String, required: true, unique: true,  match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian phone number']},
  oauth_provider: { type: String },
  oauth_id: { type: String },
  display_name: { type: String },
  avatar_url: { type: String },
  age: { type: Number },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  social_each_godson: { type: String }, // not sure of meaning; adapt
  interests: [{ type: String }],
  ml_preferences: [{ type: String }],
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  is_admin: { type: Boolean, default: false },
  is_brand_user: { type: Boolean, default: false },
  followed_brand_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Brand' }],
  wishlist_product_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  last_login: { type: Date },
  delivery_addresses: [{ type: String }],
  payment_methods: [{ type: String }]
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });
module.exports = mongoose.model('User', userSchema);