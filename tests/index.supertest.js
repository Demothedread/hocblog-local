const request = require('supertest');
const app = require('..hocblog-local/index'); // Adjust the path to where your index.js is located

describe('Test API Endpoints', () => {
  describe('/generate-blog', () => {
    it('should generate a blog post, summary, and image, and send data to the Webflow CMS API', async () => {
      const topic = 'Test Topic';
      const length = 'Medium';
      const comprehension = 'High School';

      const response = await request(app)
        .post('/generate-blog')
        .send({ topic, length, comprehension });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Blog post generated and added to Webflow CMS successfully');
      expect(response.body.webflowData._id).toBeDefined();
    });

    it('should return an error if the topic is not provided', async () => {
      const length = 'Medium';
      const comprehension = 'High School';

      const response = await request(app)
        .post('/generate-blog')
        .send({ length, comprehension });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Topic is required');
    });

    it('should return an error if the length is not provided', async () => {
      const topic = 'Test Topic';
      const comprehension = 'High School';

      const response = await request(app)
        .post('/generate-blog')
        .send({ topic, comprehension });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Length is required');
    });

    it('should return an error if the comprehension is not provided', async () => {
      const topic = 'Test Topic';
      const length = 'Medium';

      const response = await request(app)
        .post('/generate-blog')
        .send({ topic, length });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Comprehension level is required');
    });

    it('should return an error if the topic, length, and comprehension are not provided', async () => {
      const response = await request(app)
        .post('/generate-blog')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Topic, length, and comprehension level are required');
    });
  });
});

const request = require('supertest');
const app = require('../index'); // Adjust the path to where your index.js is located

describe('Test API Endpoints', () => {
  test('GET /auth should redirect to the Webflow authorization URL', async () => {
    const response = await request(app).get('/auth');
    expect(response.status).toBe(302);
    expect(response.headers.location).toContain('https://webflow.com/oauth/authorize');
  });

  // Additional tests
  test('GET /auth should have correct state parameter', async () => {
    const response = await request(app).get('/auth');
    const state = response.headers.location.split('state=')[1];
    expect(state).toBeDefined();
  });

  test('GET /auth should have correct redirect_uri parameter', async () => {
    const response = await request(app).get('/auth');
    const redirectUri = response.headers.location.split('redirect_uri=')[1];
    expect(redirectUri).toBe(process.env.REDIRECT_URI);
  });

  test('GET /auth should have correct client_id parameter', async () => {
    const response = await request(app).get('/auth');
    const clientId = response.headers.location.split('client_id=')[1];
    expect(clientId).toBe(process.env.WEBFLOW_CLIENT_ID);
  });

  test('GET /auth should have correct response_type parameter', async () => {
    const response = await request(app).get('/auth');
    const responseType = response.headers.location.split('response_type=')[1];
    expect(responseType).toBe('code');
  });
});