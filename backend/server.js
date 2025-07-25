const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
require('dotenv').config()
const productRoutes = require('./routes/productRoutes')


const app = express();

// ✅ Middlewares
app.use(cors());
app.use(express.json());

// ✅ Import your routes
const userRoutes = require('../routes/userRoutes.js'); // ✅ path is correct if file is in backend/routes/

// ✅ Use the routes
app.use('/api/users', userRoutes);

// ✅ Default route
app.get("/", (req, res) => {
  res.send("API is running");
});

// ✅ DB Connection and Server start
const PORT = process.env.PORT || 5002;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
  })
  .catch(err => console.error(err));
app.use('/api/products', productRoutes);
app.get("/", (req, res) => {
  res.send("API is running");
});
