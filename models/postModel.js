// models/postModel.js

const db = require('../utils/db');

exports.createPost = async (userId, title, content) => {
  const query = `
    INSERT INTO posts (user_id, title, content)
    VALUES ($1, $2, $3)
    RETURNING id
  `;
  const values = [userId, title, content];
  const result = await db.query(query, values);
  return result.rows[0];
};

exports.getAllPosts = async () => {
  const query = `
    SELECT posts.*, users.username
    FROM posts
    JOIN users ON posts.user_id = users.id
    ORDER BY created_at DESC
  `;
  const result = await db.query(query);
  return result.rows;
};

exports.updatePost = async (postId, title, content) => {
  const query = `
    UPDATE posts
    SET title = $1, content = $2
    WHERE id = $3
    RETURNING *
  `;
  const values = [title, content, postId];
  const result = await db.query(query, values);
  return result.rows[0];
};

exports.deletePost = async (postId) => {
  const query = `DELETE FROM posts WHERE id = $1`;
  await db.query(query, [postId]);
};

exports.searchPosts = async (keyword) => {
  const query = `
    SELECT posts.*, users.username
    FROM posts
    JOIN users ON posts.user_id = users.id
    WHERE title ILIKE $1 OR content ILIKE $1
    ORDER BY created_at DESC
  `;
  const result = await db.query(query, [`%${keyword}%`]);
  return result.rows;
};
