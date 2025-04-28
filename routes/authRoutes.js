// routes/authRoutes.js

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Registration and login routes
router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);

// 🔥 Dashboard route (only for logged-in users)
router.get('/dashboard', authController.dashboard);

module.exports = router;

// In authRoutes.js
router.get('/logout', authController.logout);
