const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const brandRoutes = require('./routes/brandRoutes');
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const cartRoutes = require('./routes/cartRoutes');


const app = express();

// ✅ Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
// ✅ Routes
app.use('/api/users', userRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/products', productRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/cart', cartRoutes);

// ✅ Root Route
app.get("/", (req, res) => {
  res.send("API is running");
});

// ✅ MongoDB Connection + Server Start
const PORT = process.env.PORT || 5002;

// Start server first, then try to connect to MongoDB
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

// Connect to MongoDB (optional for OTP generation)
if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => {
      console.log('🚀 MongoDB connected successfully');
    })
    .catch(err => {
      console.error('❌ MongoDB connection error:', err.message);
      console.log('⚠️  Server will continue running without MongoDB');
    });
} else {
  console.log('⚠️  No MONGO_URI found, running without database');
}