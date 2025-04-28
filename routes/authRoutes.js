const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { isAuthenticated } = require('../middleware/authMiddleware');

// ─── View Pages (GET Forms) ──────────────────────────────────────────

router.get('/register', authController.showRegister);   // Show registration form
router.get('/login', authController.showLogin);         // Show login form
router.get('/dashboard', isAuthenticated, authController.dashboard); // Show dashboard (protected)
router.get('/logout', authController.logout);           // Logout user

// ─── Handle Form Submissions (POST) ──────────────────────────────────

router.post('/register', authController.registerUser);  // Handle register form submit
router.post('/login', authController.loginUser);        // Handle login form submit

module.exports = router;
