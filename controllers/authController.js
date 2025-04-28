// controllers/authController.js

const { hashPassword, comparePasswords } = require('../utils/hashing');
const userModel = require('../models/userModel');
const transporter = require('../utils/email'); // NEW: Nodemailer transporter
const path = require('path');

// Temporary storage for 2FA codes
const loginCodes = {};

// REGISTER USER
exports.registerUser = async (req, res) => {
  const { username, password, email } = req.body;
  const hashed = await hashPassword(password);

  try {
    // Try to save user
    const newUser = await userModel.createUser(username, hashed, email);

    // Save session and redirect
    req.session.userId = newUser.id;
    req.session.username = username; 
    res.redirect('/auth/dashboard');

  } catch (err) {
    if (err.code === '23505') {
      // PostgreSQL error code for UNIQUE violation
      return res.status(400).send('Username or email already exists. Please choose another.');
    }
    console.error(err);
    res.status(500).send('Server error. Please try again.');
  }
};

// LOGIN USER (Step 1)
exports.loginUser = async (req, res) => {
  const { username, password } = req.body;

  const user = await userModel.findUserByUsername(username);

  if (!user) {
    return res.status(400).send('Invalid username or password');
  }

  const passwordMatch = await comparePasswords(password, user.password);

  if (!passwordMatch) {
    return res.status(400).send('Invalid username or password');
  }

  // Password correct, generate random 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000);

  // Save code temporarily
  loginCodes[username] = code;

  // Send email with code
  try {
    await transporter.sendMail({
      from: `"Secure Blog" <${process.env.GMAIL_USER}>`,
      to: user.email,
      subject: 'Your 2FA Login Code',
      text: `Your 2FA login code is: ${code}`
    });

    // Redirect user to enter the code
    res.render('verify', { username, csrfToken: req.csrfToken() });

  } catch (error) {
    console.error(error);
    res.status(500).send('Error sending email. Please try again.');
  }
};

// VERIFY 2FA CODE (Step 2)
exports.verify2FA = async (req, res) => {
  const { username, code } = req.body;

  if (parseInt(code) === loginCodes[username]) {
    // Success
    const user = await userModel.findUserByUsername(username);
    req.session.userId = user.id;
    delete loginCodes[username]; // Clean up
    req.session.username = user.username; 
    res.redirect('/auth/dashboard');
  } else {
    return res.status(400).send('Invalid 2FA code. Please try again.');
  }
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
  res.render('dashboard', { username: req.session.username });
};