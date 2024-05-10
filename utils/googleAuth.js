const { OAuth2Client } = require('google-auth-library');
const redirectUri = 'http://localhost:8000/api/auth/google/callback';

const oAuth2Client = new OAuth2Client(process.env.OAuthClientID, process.env.OAuthClientSecret, redirectUri);

module.exports = oAuth2Client;