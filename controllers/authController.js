const { hashPassword, comparePasswords } = require('../utils/hashing');
const userModel = require('../models/userModel');
const speakeasy = require('speakeasy');
const path = require('path');

// REGISTER USER
exports.registerUser = async (req, res) => {
  const { username, password, email } = req.body;
  const hashed = await hashPassword(password);

  // Generate a 2FA secret for the user
  const secret = speakeasy.generateSecret({ length: 20 });

  // Save to database (username, hashed password, email, and 2FA secret)
  await userModel.createUser(username, hashed, email, secret.base32);

  res.send('Registration successful!');
};

// LOGIN USER
exports.loginUser = async (req, res) => {
  const { username, password, token } = req.body;
  const user = await userModel.findUserByUsername(username);

  if (!user) {
    return res.status(400).send('Invalid username or password');
  }

  const passwordMatch = await comparePasswords(password, user.password);

  if (!passwordMatch) {
    return res.status(400).send('Invalid username or password');
  }

  // Now verify the 2FA token
  const verified = speakeasy.totp.verify({
    secret: user.twofa_secret,
    encoding: 'base32',
    token: token
  });

  if (!verified) {
    return res.status(400).send('Invalid authentication code');
  }

  // Save user session
  req.session.userId = user.id;

  res.send('Login successful');
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
  res.sendFile(path.join(__dirname, '../views/register.html'));
};

// Show Login Form Page
exports.showLogin = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/login.html'));
};

// Show Dashboard Page (protected)
exports.dashboard = (req, res) => {
  if (!req.session.userId) {
    return res.status(401).send('Unauthorized: Please login first.');
  }
  res.sendFile(path.join(__dirname, '../views/dashboard.html'));
};
