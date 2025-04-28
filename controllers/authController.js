// controllers/authController.js

const { hashPassword, comparePasswords } = require('../utils/hashing');
const userModel = require('../models/userModel');
const speakeasy = require('speakeasy');

// REGISTER USER
exports.registerUser = async (req, res) => {
  const { username, password, email } = req.body;
  const hashed = await hashPassword(password);
  const secret = speakeasy.generateSecret({ length: 20 });

  try {
    // Try to save user
    const newUser = await userModel.createUser(username, hashed, email, secret.base32);

    // Save session and redirect
    req.session.userId = newUser.id;
    res.redirect('/auth/dashboard');

  } catch (err) {
    if (err.code === '23505') {
      // PostgreSQL error code for UNIQUE violation
      return res.status(400).send('Username already exists. Please choose another.');
    }
    console.error(err);
    res.status(500).send('Server error. Please try again.');
  }
};

// LOGIN USER
exports.loginUser = async (req, res) => {
  const { username, password, token } = req.body;

  // Find user from hardcoded users
  const user = testUsers.find(u => u.username === username);

  if (!user) {
    return res.status(400).send('Invalid username or password');
  }

  if (password !== user.password) {
    return res.status(400).send('Invalid username or password');
  }

  // Verify 2FA code
  const verified = speakeasy.totp.verify({
    secret: user.twofa_secret,
    encoding: 'base32',
    token: token
  });

  if (!verified) {
    return res.status(400).send('Invalid authentication code');
  }

  // Set session
  req.session.userId = user.id;

  // Redirect to dashboard
  res.redirect('/auth/dashboard');
};

// LOGOUT USER
exports.logout = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).send('Could not log out.');
    }
    res.send('Logged out successfully.');
  });
};

// Show Register Form Page
exports.showRegister = (req, res) => {
  res.render('register', { csrfToken: req.csrfToken() });
};

// Show Login Form Page
exports.showLogin = (req, res) => {
  res.render('login', { csrfToken: req.csrfToken() });
};

// Show Dashboard Page (protected)
exports.dashboard = (req, res) => {
  if (!req.session.userId) {
    return res.status(401).send('Unauthorized: Please login first.');
  }
  res.render('dashboard');
};


// Temporary hardcoded users
const testUsers = [
  { id: 1, username: 'admin', password: 'password123', twofa_secret: 'KZXW6ZBAON2GK3TJ' },
  { id: 2, username: 'john', password: 'secret456', twofa_secret: 'MRUW63LFEB3GK3TP' }
];
