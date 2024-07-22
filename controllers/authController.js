import { AuthorizationCode } from 'simple-oauth2';
import dotenv from 'dotenv';
dotenv.config();

const oauth2 = new AuthorizationCode({
  client: {
    id: process.env.WEBFLOW_CLIENT_ID,
    secret: process.env.WEBFLOW_CLIENT_SECRET,
  },
  auth: {
    tokenHost: 'https://api.webflow.com',
    authorizeHost: 'https://webflow.com',
    authorizePath: '/oauth/authorize',
    tokenPath: '/oauth/access_token',
  },
});

export const authRedirect = (req, res) => {
  const state = Math.random().toString(36).substring(7);
  const authorizationUri = oauth2.authorizeURL({
    redirect_uri: process.env.REDIRECT_URI,
    scope: 'collections:write collections:read assets:write assets:read forms:write forms:read pages:write pages:read sites:write sites:read ecommerce:write ecommerce:read user:write user:read workspace:write workspace:read components:read subscriptions:read activity:read user:read',
    state,
  });
  res.redirect(authorizationUri);
};

export const authCallback = async (req, res) => {
  const { code } = req.query;
  const options = {
    code,
    redirect_uri: process.env.REDIRECT_URI,
  };

  try {
    let accessToken = req.cookies.webflow_access_token;

    if (!accessToken) {
      const result = await oauth2.getToken(options);
      accessToken = result.token.access_token;
      res.cookie('webflow_access_token', accessToken, { httpOnly: true });
    }

    res.redirect('/?authenticated=true');
  } catch (error) {
    console.error('Access Token Error:', error.message);
    res.status(500).json('Authentication failed due to Access Token Error');
  }
};