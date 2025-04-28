const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { isAuthenticated } = require('../middleware/authMiddleware');

// GET pages
router.get('/register', authController.showRegister);
router.get('/login', authController.showLogin);
router.get('/dashboard', isAuthenticated, authController.dashboard);
router.get('/logout', authController.logout);

// POST actions
router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);

module.exports = router;
