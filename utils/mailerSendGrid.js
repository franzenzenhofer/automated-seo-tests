require('dotenv').config();
const nodemailer = require('nodemailer');
const { getCurrentTimestamp } = require('../utils/sanitizers');


// Your SendGrid API key
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;

// Nodemailer transport configuration for SendGrid
const transporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 465,
  secure: true, // Use true for port 465, false for 587
  auth: {
      user: 'apikey',  // This stays as "apikey"
      pass: process.env.SENDGRID_API_KEY
  }
});

/**
 * Sends an SEO test report via email using SendGrid.
 *
 * @async
 * @param {string[]} files - Array of file paths to be attached in the email.
 * @param {string|string[]} toEmail - Recipient email address or addresses.
 * @throws {Error} Throws an error if sending the email fails.
 */
async function sendReportSendGrid(files, toEmail) {
  try {
    const mailOptions = {
      from: 'team@fullstackoptimization.com',
      to: toEmail,
      subject: `SEO Tests Report ${getCurrentTimestamp()}`,
      text: 'Attached are the generated reports.',
      html: '<b>Attached are the generated reports.</b>',
      attachments: files.map(file => ({ path: file }))
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Report sent: %s', info.messageId);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

module.exports = {
  sendReportSendGrid
};
