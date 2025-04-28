// models/userModel.js

const db = require('../utils/db');

// CREATE a new User
exports.createUser = async (username, password, email) => {
  const query = `
    INSERT INTO users (username, password, email)
    VALUES ($1, $2, $3)
    RETURNING id
  `;
  const values = [username, password, email];
  const result = await db.query(query, values);
  return result.rows[0];
};

// FIND user by username
exports.findUserByUsername = async (username) => {
  const query = `
    SELECT * FROM users
    WHERE username = $1
  `;
  const result = await db.query(query, [username]);
  return result.rows[0];
};
