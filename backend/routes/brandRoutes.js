// backend/routes/brandRoutes.js
const express = require('express');
const router = express.Router();
const { getBrandById, getBrandByName, getAllBrands, createBrand, deleteBrand, updateBrand} = require('../controllers/brandController');
const brandController = require('../controllers/brandController');

// POST create a new brand
router.post('/create', brandController.createBrand); 

// GET brand by ID
router.get('/:id', getBrandById);

// GET all brands
router.get('/', getAllBrands);

// GET brand by name
router.get('/name/:name', getBrandByName);

// Update brand by ID
router.put('/:id', updateBrand);     

// Delete brand by ID
router.delete('/:id', deleteBrand);  

router.post('/login', brandController.loginBrand);

module.exports = router;
