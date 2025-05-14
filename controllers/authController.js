// controllers/authController.js

const { hashPassword, comparePasswords } = require('../utils/hashing');
const userModel   = require('../models/userModel');
const transporter = require('../utils/email');

// In-memory store: email → { code, expiresAt }
const loginCodes = {};

// Hard-coded admin user (bypasses 2FA)
const adminUser = {
  email:    'admin@secureblog.local',
  password: 'AdminPass123',   
  name:     'Administrator'
};

// Show Register Form
exports.showRegister = (req, res) => {
  res.render('register', {
    csrfToken: req.csrfToken(),
    error:     null
  });
};

// Handle Registration
exports.registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  console.log('→ Incoming register:', { name, email });
  try {
    const hashed  = await hashPassword(password);
    const newUser = await userModel.createUser(name, email, hashed);

    // Log in immediately
    req.session.userId   = newUser.id;
    req.session.username = newUser.name;   // <— store under .username
    return res.redirect('/dashboard');

  } catch (err) {
    console.error('✖ registerUser error:', err);
    let msg = err.code === '23505'
      ? 'Unable to register User.'
      : `Error: ${err.message || 'Unexpected registration error.'}`;

    return res.render('register', {
      csrfToken: req.csrfToken(),
      error:     msg
    });
  }
};

// Show Login Form
exports.showLogin = (req, res) => {
  res.render('login', {
    csrfToken: req.csrfToken(),
    error:     null
  });
};

// Handle Login (Step 1)
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  // Admin bypass
  if (email === adminUser.email && password === adminUser.password) {
    req.session.userId   = 'admin';
    req.session.username = adminUser.name; 
    return res.redirect('/dashboard');
  }

  // Lookup user
  const user = await userModel.findUserByEmail(email);
  if (!user || !(await comparePasswords(password, user.password))) {
    return res.render('login', {
      csrfToken: req.csrfToken(),
      error:     'Invalid email or password.'
    });
  }

  // Generate 6-digit code + expiry
  const code = Math.floor(100000 + Math.random() * 900000);
  loginCodes[email] = {
    code,
    expiresAt: Date.now() + 5 * 60 * 1000  // valid for 5 minutes
  };

  // Send via email
  try {
    await transporter.sendMail({
      from:    `"SecureBlog" <${process.env.GMAIL_USER}>`,
      to:      email,
      subject: 'Your SecureBlog 2FA Code',
      text:    `Your login code is: ${code}`
    });

    return res.render('verify', {
      csrfToken: req.csrfToken(),
      email,
      error:     null
    });

  } catch (err) {
    console.error('✖ 2FA email send error:', err);
    return res.render('login', {
      csrfToken: req.csrfToken(),
      error:     'Could not send verification email.'
    });
  }
};

// Handle 2FA Verify (Step 2)
exports.verify2FA = async (req, res) => {
  const { email, code } = req.body;
  const entry = loginCodes[email];

  // No code generated or expired
  if (!entry) {
    return res.render('verify', {
      csrfToken: req.csrfToken(),
      email,
      error:     'No code pending. Please try logging in again.'
    });
  }
  if (Date.now() > entry.expiresAt) {
    delete loginCodes[email];
    return res.render('verify', {
      csrfToken: req.csrfToken(),
      email,
      error:     'Code expired. Please log in again.'
    });
  }

  // Wrong code
  if (parseInt(code, 10) !== entry.code) {
    return res.render('verify', {
      csrfToken: req.csrfToken(),
      email,
      error:     'Incorrect code. Try again.'
    });
  }

  // Success!
  delete loginCodes[email];
  const user = await userModel.findUserByEmail(email);
  req.session.userId   = user ? user.id : 'admin';
  req.session.username = user ? user.name : adminUser.name;  

  return res.redirect('/dashboard');
};

// Add this at the bottom, after verify2FA:
exports.showVerify = (req, res) => {
  // Retrieve pending email from session
  const email = req.session.pendingEmail;
  if (!email) {
    return res.redirect('/login');
  }
  res.render('verify', {
    csrfToken: req.csrfToken(),
    email,
    error: null
  });
};

// Show Dashboard (protected)
exports.dashboard = (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  res.render('dashboard', {
    username: req.session.username   
  });
};

// Logout
exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
};
