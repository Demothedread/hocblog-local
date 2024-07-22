import axios from 'axios';

export const createWebflowClient = (accessToken) => {
  return axios.create({
    baseURL: 'https://api.webflow.com',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'accept-version': '1.0.0',
    }
  });
};