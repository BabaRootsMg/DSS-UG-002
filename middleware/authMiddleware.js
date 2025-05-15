
//Ensure user is authenticated and populate req.user with id and username
exports.isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId && req.session.username) {
    // Attach both id and username for downstream code
    req.user = {
      id:       req.session.userId,
      username: req.session.username
    };
    return next();
  }
  res.redirect('/login');
};

// Get asingle post by ID
exports.getPostById = async (postId) => {
  const result = await db.query(
    `SELECT p.id,
            p.title,
            p.content,
            p.created_at AS timestamp,
            u.name        AS username
     FROM posts p
     JOIN users u ON p.user_id = u.id
     WHERE p.id = $1`,
    [postId]
  );
  return result.rows[0];
};
