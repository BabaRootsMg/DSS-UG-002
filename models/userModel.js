const db = require('../utils/db');

// models/userModel.js
exports.createUser = async (name, email, password, twofa_secret = '') => {
    const query = `
      INSERT INTO users (name, email, password, twofa_secret)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, email, twofa_secret
    `;
    const values = [name, email, password, twofa_secret];
    const result = await db.query(query, values);
    return result.rows[0];
  };

// Find user by email
exports.findUserByEmail = async (email) => {
  const result = await db.query(
    `SELECT * FROM users WHERE email = $1`,
    [email]
  );
  return result.rows[0];
};