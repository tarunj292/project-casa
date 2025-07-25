const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');

// ⭐ CRUD routes for Users
router.post('/', userController.createUser);        // Create user
router.get('/', userController.getUsers);           // Get all users
router.get('/:id', userController.getUserById);     // Get single user by ID
router.put('/:id', userController.updateUser);      // Update user
router.delete('/:id', userController.deleteUser);   // Delete user

// ⭐ OTP route (using generateOtp from userController itself)
router.post('/generate-otp', userController.generateOtp);

module.exports = router;
