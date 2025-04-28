// server.js

require('dotenv').config(); // Always load environment variables FIRST

const express = require('express');
const session = require('express-session');
const csrf = require('csurf');
const pgSession = require('connect-pg-simple')(session);
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');
const db = require('./utils/db');

const app = express();

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// If you're behind a proxy (e.g., production), trust it for secure cookies
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// ─── Global Middleware ──────────────────────────────────────────────

// Security headers
app.use(helmet());

// HTTP request logging
app.use(morgan('dev'));

// Parse JSON and urlencoded form bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets from /public
app.use(express.static(path.join(__dirname, 'public')));

// Session Middleware
app.use(session({
  store: new pgSession({
    pool: db,
    tableName: 'session' // Your session table
  }),
  secret: process.env.SESSION_SECRET,  // Must provide secret
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 15, // 15 minutes
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax'
  }
}));

// Initialize CSRF protection
app.use(csrf());

// ─── Routes ─────────────────────────────────────────────────────────

// Import routes
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');

// Mount auth routes first
app.use('/auth', authRoutes);

// 🚀 Home Page Route (before post routes)
app.get('/', (req, res) => {
  if (req.session.userId) {
    return res.redirect('/auth/dashboard');
  }
  res.render('home'); // Render home.ejs
});

// Mount post routes second
app.use('/', postRoutes);

// Quick DB-connect test (optional)
app.get('/db-test', async (req, res, next) => {
  try {
    const { rows } = await db.query('SELECT NOW()');
    res.json({ now: rows[0].now });
  } catch (err) {
    next(err);
  }
});

// ─── Error Handling ─────────────────────────────────────────────────

// CSRF token errors
app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).send('Invalid CSRF token');
  }
  next(err);
});

// 404 Not Found
app.use((req, res) => {
  res.status(404).send('Not Found');
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong');
});

// ─── Start Server ───────────────────────────────────────────────────

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
