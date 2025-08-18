const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const brandRoutes = require('./routes/brandRoutes');
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');
const cartRoutes = require('./routes/cartRoutes');
const chatRoutes = require('./routes/chatRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const curatedListRoutes = require('./routes/curatedList');
const paymentRoutes = require('./routes/paymentRoutes');

const shopifyRoutes = require('./routes/shopifyRoutes');
// If your product routes are in a different file, make sure to add the new route there
const app = express();

// Middlewares
// Middlewares
// ❌ Old configuration that allows all origins
// app.use(cors());

// ✅ New, secure configuration
// This sets the allowed origins for your API requests
const allowedOrigins = [
    process.env.FRONTEND_URL, // Production URL (https://casashop.in)
    'http://localhost:3000',  // For local development (common for React/Next.js)
    'http://localhost:5173',  // For local development (common for Vite)
    'http://localhost:5174',  // For local development (current Vite port)
    'http://localhost:4173',  // For Vite preview
    'http://127.0.0.1:5173', // Alternative localhost format
    'http://127.0.0.1:5174', // Alternative localhost format for current port
    'http://127.0.0.1:3000'  // Alternative localhost format
].filter(Boolean); // Remove any undefined values

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        // or if the origin is in our allowed list
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.log(`🚫 CORS blocked origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true, // Allow cookies and authentication headers
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions)); // Apply the new CORS middleware with your custom options
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/curatedlist', curatedListRoutes); 
app.use('/api/payments', paymentRoutes);
app.use('/api', shopifyRoutes);


// Default route
app.get("/", (req, res) => {
  res.send("API is running");
});

// Health check endpoint
app.get("/health", (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: dbStatus,
    uptime: process.uptime()
  });
});

// DB Connection and server start
const PORT = process.env.PORT || 5002;

if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => {
      console.log('✅ MongoDB connected successfully');
      // ✅ Start server only after DB connection
      app.listen(PORT, () => {
        console.log(`✅ Server running on port ${PORT}`);
      });
    })
    .catch(err => {
      console.error('❌ MongoDB connection error:', err.message);
      console.log('⚠️ Exiting server due to DB failure');
      process.exit(1); // Stop server if DB is critical
    });
} else {
  console.log('⚠️ No MONGO_URI found, running without database');
  app.listen(PORT, () => {
    console.log(`⚠️ Server running on port ${PORT} without DB`);
  });
}
