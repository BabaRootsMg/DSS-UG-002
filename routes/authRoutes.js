const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { isAuthenticated } = require('../middleware/authMiddleware');

// Pages (GET)
router.get('/register', authController.showRegister);
router.get('/login', authController.showLogin);
router.get('/dashboard', isAuthenticated, authController.dashboard);
router.get('/logout', authController.logout);

// Forms (POST)
router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);

module.exports = router;
