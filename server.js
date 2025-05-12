require('dotenv').config();

const express    = require('express');
const path       = require('path');
const helmet     = require('helmet');
const morgan     = require('morgan');
const session    = require('express-session');
const pgSession  = require('connect-pg-simple')(session);
const csrf       = require('csurf');
const db         = require('./utils/db');

const app = express();
const { isAuthenticated } = require('./middleware/authMiddleware');

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(
  helmet({
    contentSecurityPolicy: false
  })
);
// Add a basic Content-Security-Policy
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc:  ["'self'"],
      styleSrc:   ["'self'", "https://cdnjs.cloudflare.com"],
      imgSrc:     ["'self'", "data:"],
      connectSrc: ["'self'"],
      fontSrc:    ["'self'", "https://cdnjs.cloudflare.com"],
    },
  })
);

app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Session and CSRF
app.use(
  session({
    store: new pgSession({ pool: db, tableName: 'session' }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 15 * 60 * 1000,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    }
  })
);
app.use(csrf());

// Bootstrap `req.user`, then expose `user` & `csrfToken` to ALL templates 
app.use((req, res, next) => {
  // Populate req.user from the session, so templates always see it
  if (req.session.userId && req.session.username) {
    req.user = {
      id:       req.session.userId,
      username: req.session.username
    };
  }
  res.locals.user      = req.user || null;
  res.locals.csrfToken = req.csrfToken();
  next();
});

// Root & redirect
app.get('/', (req, res) => {
  if (req.user) return res.redirect('/dashboard');
  res.redirect('/login');
});

// Dashboard view
app.get('/dashboard', isAuthenticated, (req, res) => {
  res.render('dashboard');
});

// Auth Routes
app.use('/', require('./routes/authRoutes'));

// Post Routes
app.use('/posts', require('./routes/postRoutes'));

// Legacy Redirect
app.get('/my-posts', isAuthenticated, (req, res) => {
  res.redirect(301, '/posts/my');
});

// Error Handling
// CSRF errors
app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).send('Invalid CSRF token');
  }
  next(err);
});
// 404
app.use((req, res) => res.status(404).send('Page not found'));
// 500
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
