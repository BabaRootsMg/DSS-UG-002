const express = require('express');
const router  = express.Router();
const auth    = require('../controllers/authController');
const { isAuthenticated } = require('../middleware/authMiddleware');

// Show registration & login forms
router.get('/register', auth.showRegister);
router.get('/login',    auth.showLogin);

// (Optional) Show 2FA verify form if you have one
router.get('/verify', isAuthenticated, auth.showVerify);

// Handle submissions
router.post('/register', auth.registerUser);
router.post('/login',    auth.loginUser);
router.post('/verify',   auth.verify2FA);

// Secure logout via POST
router.post('/logout', isAuthenticated, auth.logout);

module.exports = router;
