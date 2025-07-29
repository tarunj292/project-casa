const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const brandRoutes = require('./routes/brandRoutes');
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes'); // disable if error

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/products', productRoutes)

// Default route
app.get("/", (req, res) => {
  res.send("API is running");
});

// DB Connection and server start
const PORT = process.env.PORT || 5002;
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));
