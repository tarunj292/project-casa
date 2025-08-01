// backend/routes/brandRoutes.js
const express = require('express');
const router = express.Router();
const { getBrandById, getBrandByName, getAllBrands, createBrand, deleteBrand, updateBrand} = require('../controllers/brandController');
const brandController = require('../controllers/brandController');


// POST create a new brand
router.post('/create', brandController.createBrand); 

// GET all brands
router.get('/', getAllBrands);

// GET brand by name
router.get('/name/:name', getBrandByName);

// GET brand by ID
router.get('/:id', getBrandById);

router.put('/:id', updateBrand);     // Update brand by ID

router.delete('/:id', deleteBrand);  // Delete brand by ID

module.exports = router;
