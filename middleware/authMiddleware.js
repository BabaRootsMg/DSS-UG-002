// middleware/authMiddleware.js

exports.isAuthenticated = (req, res, next) => {
  if (req.session.userId) {
    next(); // user is authenticated
  } else {
    res.status(401).send('Unauthorized: Please log in.');
  }
};
