const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,  // your Gmail address (from .env)
    pass: process.env.GMAIL_PASS   // your Gmail App Password
  }
});

module.exports = transporter;