import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

export const createWebflowClient = async () => {
  const apiToken = process.env.WEBFLOW_API_TOKEN;

  try {
    // Exchange the API token for an access token if needed
    const response = await axios.post('https://api.webflow.com/oauth/access_token', {
      client_id: process.env.WEBFLOW_CLIENT_ID,
      client_secret: process.env.WEBFLOW_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code: apiToken
    });

    const accessToken = response.data.access_token;

    // Create and return the axios instance with the access token
    return axios.create({
      baseURL: 'https://api.webflow.com',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'accept-version': '1.0.0',
      }
    });
  } catch (error) {
    console.error('Error exchanging API token for access token:', error);
    throw new Error('Failed to authenticate with Webflow API');
  }
};
