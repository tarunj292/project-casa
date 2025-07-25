// backend/routes/brandRoutes.js

const express = require('express');
const router = express.Router();
const { getBrandById, getBrandByName } = require('../controllers/brandController');

// Route to get a brand by its MongoDB ID
router.get('/id/:id', getBrandById);

// Route to get a brand by its name (case-insensitive)
router.get('/name/:name', getBrandByName);

module.exports = router;
