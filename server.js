// server.js

require('dotenv').config();
const express = require('express');
const session = require('express-session');
const csrf = require('csurf');
const pgSession = require('connect-pg-simple')(session);
const path = require('path');
const db = require('./utils/db'); // We'll also create a basic db.js for now

const app = express();

// Body Parser Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Static Folder (optional)
app.use(express.static(path.join(__dirname, 'public')));

// Session Middleware
app.use(session({
  store: new pgSession({
    pool: db, // Connection pool
    tableName: 'session' // You can customize table name if you want
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 15, // 15 minutes
    secure: false, // true if HTTPS
    httpOnly: true
  }
}));

// CSRF Protection Middleware
app.use(csrf());

// Test Route
app.get('/', (req, res) => {
  res.send(`Hello World! Your CSRF token is: ${req.csrfToken()}`);
});

// Server Listen
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));