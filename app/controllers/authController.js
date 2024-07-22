import { AuthorizationCode } from 'simple-oauth2';
import dotenv from 'dotenv';

dotenv.config();

const client = new AuthorizationCode({
  client: {
    id: process.env.WEBFLOW_CLIENT_ID,
    secret: process.env.WEBFLOW_CLIENT_SECRET,
  },
  auth: {
    tokenHost: 'https://api.webflow.com',
    authorizePath: '/oauth/authorize',
    tokenPath: '/oauth/access_token',
  },
});

export const authRedirect = (req, res) => {
  const authorizationUri = client.authorizeURL({
    redirect_uri: process.env.REDIRECT_URI,
    scope: 'read_sites write_sites',
    state: 'randomState',
  });

  res.redirect(authorizationUri);
};

export const authCallback = async (req, res) => {
  const { code } = req.query;

  try {
    const accessToken = await client.getToken({
      code,
      redirect_uri: process.env.REDIRECT_URI,
    });

    res.cookie('webflow_access_token', accessToken.token.access_token, {
      httpOnly: true,
    });

    res.redirect('/');
  } catch (error) {
    console.error('Access Token Error', error.message);
    res.status(500).json('Authentication failed');
  }
};
