const mongoose = require('mongoose');

const shipmentSchema = new mongoose.Schema({
  billing_customer_name: { type: String, required: true },
  billing_phone: { 
    type: String, 
    required: true,
    match: [/^(?:\+?91[-\s]?)?[6-9]\d{9}$/, 'Invalid Indian phone number']
  },
  billing_email: { 
    type: String, 
    required: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, 'Invalid email']
  },
  billing_address: { type: String, required: true }, // flat + wing OR addressLine
  billing_address_2: { type: String, default: "" }, // landmark (optional)
  billing_city: { type: String, required: true },
  billing_pincode: { 
    type: Number, 
    required: true,
    match: [/^\d{6}$/, 'Invalid pincode']
  },
  billing_state: { type: String, required: true },
  billing_country: { type: String, default: "India" },
  isDefault: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
}, { _id: true });

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, sparse: true },
  phone: { type: String, required: true, unique: true },
  oauth_provider: { type: String },
  oauth_id: { type: String },
  display_name: { type: String },
  avatar_url: { type: String },
  age: { type: Number },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  social_each_godson: { type: String }, // keeping original
  interests: [{ type: String }],
  ml_preferences: [{ type: String }],
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  is_admin: { type: Boolean, default: false },
  is_brand_user: { type: Boolean, default: false },
  followed_brand_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Brand' }],
  last_login: { type: Date },

  // Existing fields preserved
  delivery_addresses: [{ type: String }],
  payment_methods: [{ type: String }],

  // ✅ New field for multiple saved shipment addresses
  shipment: [shipmentSchema]

}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = mongoose.model('User', userSchema);
