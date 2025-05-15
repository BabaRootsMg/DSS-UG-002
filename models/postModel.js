const db = require('../utils/db');

// Create a new post
exports.createPost = async (userId, title, content) => {
  const result = await db.query(
    `INSERT INTO posts (user_id, title, content)
     VALUES ($1, $2, $3)
     RETURNING id, title, content, created_at AS timestamp`,
    [userId, title, content]
  );
  return result.rows[0];
};

// Get all posts
exports.getAllPosts = async () => {
  const result = await db.query(
    `SELECT p.id,
            p.title,
            p.content,
            p.created_at AS timestamp,
            u.name        AS username
     FROM posts p
     JOIN users u ON p.user_id = u.id
     ORDER BY p.created_at DESC`
  );
  return result.rows;
};

// Fetch a single post by ID
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

// Update a post
exports.updatePost = async (postId, title, content) => {
  const result = await db.query(
    `UPDATE posts
     SET title = $1,
         content = $2
     WHERE id = $3
     RETURNING id, title, content, created_at AS timestamp`,
    [title, content, postId]
  );
  return result.rows[0];
};

// Delete a post
exports.deletePost = async (postId) => {
  await db.query(`DELETE FROM posts WHERE id = $1`, [postId]);
};

// Search posts by keyword
exports.searchPosts = async (keyword) => {
  const term = `%${keyword}%`;
  const result = await db.query(
    `SELECT p.id,
            p.title,
            p.content,
            p.created_at AS timestamp,
            u.name        AS username
     FROM posts p
     JOIN users u ON p.user_id = u.id
     WHERE p.title ILIKE $1 OR p.content ILIKE $1`,
    [term]
  );
  return result.rows;
};

//fetch all posts for a specific user
exports.getPostsByUser = async (userId) => {
  const result = await db.query(
    `SELECT id,
            title,
            content,
            created_at AS timestamp
     FROM posts
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId]
  );
  return result.rows;
};
