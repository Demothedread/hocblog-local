const request = require('supertest');
const express = require('express');
const app = require('../index'); // Adjust the path to where your index.js is located
require('dotenv').config();

describe('Test API Endpoints', () => {
  test('GET /auth should redirect to the Webflow authorization URL', async () => {
    const response = await request(app).get('/auth');
    expect(response.status).toBe(302);
    expect(response.headers.location).toContain('https://webflow.com/oauth/authorize');
  });

  test('GET /callback should handle Webflow OAuth callback', async () => {
    // Mock axios.post to simulate the OAuth token exchange
    const axios = require('axios');
    axios.post = jest.fn().mockResolvedValue({
      data: { access_token: 'mocked_token' }
    });

    const response = await request(app).get('/callback?code=mocked_code');
    expect(response.status).toBe(200);
    expect(response.text).toContain('Access Token: mocked_token');
  });

  test('POST /webhook should handle export command', async () => {
    const axios = require('axios');
    axios.post = jest.fn().mockResolvedValue({ status: 200 });

    const response = await request(app).post('/webhook').send({ text: '/export some data' });
    expect(response.status).toBe(200);
    expect(response.text).toBe('Data exported successfully.');
  });

  test('POST /generate-blog should generate blog post', async () => {
    const axios = require('axios');
    axios.post = jest.fn()
      .mockResolvedValueOnce({ data: { choices: [{ message: { content: 'Generated blog post' } }] } })
      .mockResolvedValueOnce({ data: { choices: [{ message: { content: 'Blog summary' } }] } })
      .mockResolvedValueOnce({ data: { data: [{ url: 'image_url' }] } })
      .mockResolvedValueOnce({ data: { _id: 'webflow_item_id' } });

    const response = await request(app)
      .post('/generate-blog')
      .send({ topic: 'Test Topic', length: 'Medium', comprehension: 'High School' });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Blog post generated and added to Webflow CMS successfully');
    expect(response.body.webflowData._id).toBe('webflow_item_id');
  });
});
