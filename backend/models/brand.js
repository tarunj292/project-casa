const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  logo_url: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  website: {
    type: String
  },
  social_links: {
    type: [String] // array of URLs
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
  },
  password: {
    type: String,
    required: true
  },
  crm_user_ids: {
    type: [String]
  },
  inventory_sync_status: {
    type: String
  },
  is_active: {
    type: Boolean,
    default: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date
  }
});

module.exports = mongoose.model('Brand', brandSchema);
