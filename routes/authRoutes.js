const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { isAuthenticated } = require('../middleware/authMiddleware'); // <-- Import middleware

// Registration and login routes
router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);

// Protect dashboard route!
router.get('/dashboard', isAuthenticated, authController.dashboard);

router.get('/logout', authController.logout); // Optional


router.get('/register', authController.showRegister);
router.get('/login', authController.showLogin);
router.get('/dashboard', isAuthenticated, authController.dashboard);
router.get('/logout', authController.logout);