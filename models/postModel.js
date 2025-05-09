// models/postModel.js

const db = require('../utils/db');

// CREATE a Post
exports.createPost = async (userId, title, content) => {
  const query = `
    INSERT INTO posts (user_id, title, content)
    VALUES ($1, $2, $3)
    RETURNING *
  `;
  const values = [userId, title, content];
  const result = await db.query(query, values);
  return result.rows[0];
};

// GET all Posts
exports.getAllPosts = async () => {
  const query = `
    SELECT posts.id, posts.title, posts.content, posts.created_at, users.username
    FROM posts
    JOIN users ON posts.user_id = users.id
    ORDER BY posts.created_at DESC
  `;
  const result = await db.query(query);
  return result.rows;
};

// UPDATE a Post
exports.updatePost = async (postId, title, content) => {
  const query = `
    UPDATE posts
    SET title = $1, content = $2, updated_at = NOW()
    WHERE id = $3
    RETURNING *
  `;
  const values = [title, content, postId];
  const result = await db.query(query, values);
  return result.rows[0];
};

// DELETE a Post
exports.deletePost = async (postId) => {
  const query = `
    DELETE FROM posts
    WHERE id = $1
  `;
  await db.query(query, [postId]);
};

// SEARCH Posts by keyword (ILIKE for case-insensitive)
exports.searchPosts = async (keyword) => {
  const query = `
    SELECT posts.id, posts.title, posts.content, posts.created_at, users.username
    FROM posts
    JOIN users ON posts.user_id = users.id
    WHERE posts.title ILIKE $1 OR posts.content ILIKE $1
    ORDER BY posts.created_at DESC
  `;
  const values = [`%${keyword}%`];
  const result = await db.query(query, values);
  return result.rows;
};
