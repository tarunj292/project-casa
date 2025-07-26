const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// ⭐ CRUD routes for Users
router.post('/', userController.createUser);         // Create user
router.get('/', userController.getUsers);            // Get all users with optional filters
router.post('/generate-otp', userController.generateOtp); // OTP route

router.get('/:id', userController.getUserById);       // Get user by ID
router.put('/:id', userController.updateUser);        // Update user
router.delete('/:id', userController.deleteUser);     // Delete user

module.exports = router;
