// backend/routes/brandRoutes.js
const express = require('express');
const router = express.Router();
const { getBrandById, getBrandByName, getAllBrands } = require('../controllers/brandController');

// GET all brands
router.get('/', getAllBrands);

// GET brand by ID
router.get('/id/:id', getBrandById);

// GET brand by name
router.get('/name/:name', getBrandByName);

module.exports = router;
