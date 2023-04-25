const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');
const SCOPES = ['https://www.googleapis.com/auth/webmasters'];

const TOKEN_PATH = 'token.json';
const CLIENT_SECRETS_PATH = 'client_secrets.json';

const authenticate = async () => {
  const clientSecrets = JSON.parse(fs.readFileSync(CLIENT_SECRETS_PATH));
  const { client_id, client_secret, redirect_uris } = clientSecrets.installed;
  const oAuth2Client = new OAuth2Client(client_id, client_secret, redirect_uris[0]);

  try {
    const token = fs.readFileSync(TOKEN_PATH);
    oAuth2Client.setCredentials(JSON.parse(token));
  } catch (err) {
    const newToken = await getNewToken(oAuth2Client);
    oAuth2Client.setCredentials(newToken);
  }

  return oAuth2Client;
};

const getNewToken = async (oAuth2Client) => {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
  });

  console.log('Authorize this app by visiting this url:', authUrl);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const code = await new Promise((resolve) => {
    rl.question('Enter the code from that page here: ', (code) => {
      rl.close();
      resolve(code);
    });
  });

  const { tokens } = await oAuth2Client.getToken(code);
  console.log('Obtained tokens:', tokens); 
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
  console.log('Token stored to', TOKEN_PATH);
  return tokens;

};

module.exports = authenticate;
