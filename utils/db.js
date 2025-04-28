// utils/db.js
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // you can add ssl: { rejectUnauthorized: false } for some hosts
});

module.exports = pool;
