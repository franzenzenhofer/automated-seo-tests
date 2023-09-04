require('dotenv').config();
const nodemailer = require('nodemailer');
const axios = require('axios');

/**
 * Nodemailer transport configuration.
 */
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: 'team@fullstackoptimization.com',
    clientId: process.env.GMAIL_CLIENT_ID,
    clientSecret: process.env.GMAIL_CLIENT_SECRET,
    refreshToken: process.env.GMAIL_REFRESH_TOKEN
  }
});

/**
 * Refreshes the OAuth2 access token.
 *
 * @async
 * @returns {string} The refreshed access token.
 * @throws {Error} Throws an error if refreshing the access token fails.
 */
async function refreshAccessToken() {
  try {
    const response = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: process.env.GMAIL_CLIENT_ID,
      client_secret: process.env.GMAIL_CLIENT_SECRET,
      refresh_token: process.env.GMAIL_REFRESH_TOKEN,
      grant_type: 'refresh_token'
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      transformRequest: [function (data) {
        return Object.keys(data)
          .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`)
          .join('&');
      }]
    });

    if (response.data && response.data.access_token) {
      return response.data.access_token;
    } else {
      throw new Error("Failed to refresh access token.");
    }
  } catch (error) {
    console.error("Error in refreshAccessToken:", error);
    throw error;
  }
}

/**
 * Sends an SEO test report via email.
 *
 * @async
 * @param {string[]} files - Array of file paths to be attached in the email.
 * @param {string} toEmail - Recipient email address.
 * @throws {Error} Throws an error if sending the email fails.
 */
async function sendReport(files, toEmail) {
  try {
    const newAccessToken = await refreshAccessToken();

    // Update the transporter with the new access token
    transporter.set('oauth2.access.token', newAccessToken);

    const mailOptions = {
      from: 'team@fullstackoptimization.com',
      to: toEmail,
      subject: 'SEO Tests Report',
      text: 'Attached are the generated reports.',
      attachments: files.map(file => ({ path: file }))
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Report sent: %s', info.messageId);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

module.exports = {
  sendReport
};
