// server.js


require('dotenv').config();
const express = require('express');
const session = require('express-session');
const csrf = require('csurf');
const pgSession = require('connect-pg-simple')(session);
const path = require('path');
const db = require('./utils/db'); // We'll also create a basic db.js for now
const helmet = require('helmet');
const morgan = require('morgan');
const app = express();

// If you're behind a proxy (e.g. in production), trust it for secure cookies
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
    pool: db, // Connection pool
    tableName: 'session' // You can customize table name if you want
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 15,         // 15 minutes
    secure: process.env.NODE_ENV === 'production', // only over HTTPS in prod
    httpOnly: true,                 // no client-side JS access
    sameSite: 'lax'                 // helps mitigate CSRF
  }
}));

// initialize CSRF protection
app.use(csrf());

// ─── Routes ─────────────────────────────────────────────────────────

// Health check
app.get('/', (req, res) => {
  res.send(`📝 Blog backend up and running — your CSRF token is: ${req.csrfToken()}`);
});

// Quick DB-connect test
app.get('/db-test', async (req, res, next) => {
  try {
    const { rows } = await db.query('SELECT NOW()');
    res.json({ now: rows[0].now });
  } catch (err) {
    next(err);
  }
});

// (Here is where you’ll mount your routes for /posts, /auth, etc.)

// ─── 404 & Error Handling ───────────────────────────────────────────

// CSRF token errors — respond with 403
app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).send('Invalid CSRF token');
  }
  next(err);
});

// 404 for anything else
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
app.listen(PORT, () =>
  console.log(`Server listening on http://localhost:${PORT}`)
);
