// server.js

require('dotenv').config();            // 1️⃣ Load .env
const express       = require('express');
const session       = require('express-session');
const csrf          = require('csurf');
const pgSession     = require('connect-pg-simple')(session);
const path          = require('path');
const helmet        = require('helmet');
const morgan        = require('morgan');
const db            = require('./utils/db');

const app = express();

// ─── View Engine ────────────────────────────────────────────────────
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ─── Security & Logging ─────────────────────────────────────────────
app.use(helmet());
app.use(morgan('dev'));

// ─── Body Parsing & Static ──────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ─── Sessions & CSRF ────────────────────────────────────────────────
app.use(session({
  store: new pgSession({ pool: db, tableName: 'session' }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 15 * 60 * 1000,
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax'
  }
}));
app.use(csrf());

// ─── ROUTES ─────────────────────────────────────────────────────────

// 1️⃣ Redirect the root URL → /home
app.get('/', (req, res) => {
  res.redirect('/home');
});

// 2️⃣ Public landing page (no auth required)
app.get('/home', (req, res) => {
  if (req.session.userId) {
    return res.redirect('/auth/dashboard');
  }
  res.render('home'); // make sure views/home.ejs exists
});

// 3️⃣ Auth routes (login, register, verify, dashboard, logout)
app.use('/auth', require('./routes/authRoutes'));

// 4️⃣ Post routes under /posts
app.use('/posts', require('./routes/postRoutes'));

// 5️⃣ Optional DB test endpoint
app.get('/db-test', async (req, res, next) => {
  try {
    const { rows } = await db.query('SELECT NOW()');
    res.json({ now: rows[0].now });
  } catch (err) {
    next(err);
  }
});

// ─── ERROR HANDLING ─────────────────────────────────────────────────

// CSRF errors → 403
app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).send('Invalid CSRF token');
  }
  next(err);
});

// 404 fallback
app.use((req, res) => {
  res.status(404).send('Not Found');
});

// 500 global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong');
});

// ─── START SERVER ───────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
