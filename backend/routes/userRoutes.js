const express = require('express');
const router = express.Router();

// ✅ FIX THIS PATH
const userController = require('../controllers/userController.js');

// your routes
router.post('/', userController.createUser);
router.get('/', userController.getUsers);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);
router.post('/generate-otp', userController.generateOtp);

module.exports = router;
