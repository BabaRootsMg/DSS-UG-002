// models/userModel.js

const db = require('../utils/db');

exports.createUser = async (username, password, email, twofa_secret) => {
  const query = `
    INSERT INTO users (username, password, email, twofa_secret)
    VALUES ($1, $2, $3, $4)
    RETURNING id
  `;
  const values = [username, password, email, twofa_secret];
  const result = await db.query(query, values);
  return result.rows[0];
};

exports.findUserByUsername = async (username) => {
  const query = `SELECT * FROM users WHERE username = $1`;
  const result = await db.query(query, [username]);
  return result.rows[0];
};
