// utils/sendEmail.js
require('dotenv').config(); // ✅ Ensures .env is loaded for this file

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,   
    pass: process.env.EMAIL_PASS      
  },
  tls: {
    rejectUnauthorized: false
  }
});

exports.sendWelcomeEmail = async (toEmail, name) => {
  const mailOptions = {
    from: `"Fly8" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: '🎉 Welcome to FlightSys!',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Hi ${name},</h2>
        <p>✈️ Welcome aboard <strong>FlightSys</strong> — your digital co-pilot in pilot training.</p>
        <p>We’re excited to have you on board! You can now log in and enroll in your first course.</p>
        <p>Let the journey to the skies begin!</p>
        <br/>
        <p>🛫 Happy flying,<br/><strong>FlightSys Team</strong></p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};
