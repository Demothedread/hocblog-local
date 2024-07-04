const express = require('express');
const axios = require('axios');
const querystring = require('querystring');
require('dotenv').config();

const app = express();

const CLIENT_ID = process.env.WEBFLOW_CLIENT_ID;
const CLIENT_SECRET = process.env.WEBFLOW_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

app.get('/auth', (req, res) => {
    const authUrl = `https://webflow.com/oauth/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=assets:read assets:write authorized_user:read cms:read cms:write custom_code:read custom_code:write forms:read forms:write pages:read pages:write sites:read sites:write`;
    res.redirect(authUrl);
});

app.get('/callback', async (req, res) => {
    const { code } = req.query;

    try {
        const response = await axios.post('https://api.webflow.com/oauth/access_token', querystring.stringify({
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            grant_type: 'authorization_code',
            code,
            redirect_uri: REDIRECT_URI
        }));

        const { access_token } = response.data;
        console.log(`Access Token: ${access_token}`);
        res.send(`Access Token: ${access_token}`);
    } catch (error) {
        console.error('Error getting access token:', error);
        res.status(500).send('Error getting access token');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`OAuth server is running on port ${PORT}`);
});
