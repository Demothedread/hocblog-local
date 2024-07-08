const app = require('../index'); // Import the express app
const request = require('supertest'); // Import the testing library

describe('OAuth Server', () => {
  describe('/auth', () => {
    it('should return a redirect to the Webflow OAuth authorization page with the correct scope', async () => {
      const response = await request(app).get('/auth');

      expect(response.status).toBe(302);
      expect(response.headers.location).toContain('scope=assets:read assets:write authorized_user:read cms:read cms:write custom_code:read custom_code:write forms:read forms:write pages:read pages:write sites:read sites:write');
    });

    it('should return a redirect to the Webflow OAuth authorization page with the correct scope when accessed with a GET request', async () => {
      const response = await request(app).get('/auth');

      expect(response.status).toBe(302);
      expect(response.headers.location).toContain('scope=assets:read assets:write authorized_user:read cms:read cms:write custom_code:read custom_code:write forms:read forms:write pages:read pages:write sites:read sites:write');
    });

    it('should return a redirect to the Webflow OAuth authorization page with the correct scope when accessed with a POST request', async () => {
      const response = await request(app).post('/auth');

      expect(response.status).toBe(302);
      expect(response.headers.location).toContain('scope=assets:read assets:write authorized_user:read cms:read cms:write custom_code:read custom_code:write forms:read forms:write pages:read pages:write sites:read sites:write');
    });

    it('should return a redirect to the Webflow OAuth authorization page with the correct scope when accessed with a PUT request', async () => {
      const response = await request(app).put('/auth');

      expect(response.status).toBe(302);
      expect(response.headers.location).toContain('scope=assets:read assets:write authorized_user:read cms:read cms:write custom_code:read custom_code:write forms:read forms:write pages:read pages:write sites:read sites:write');
    });

    it('should return a redirect to the Webflow OAuth authorization page with the correct scope when accessed with a DELETE request', async () => {
      const response = await request(app).delete('/auth');

      expect(response.status).toBe(302);
      expect(response.headers.location).toContain('scope=assets:read assets:write authorized_user:read cms:read cms:write custom_code:read custom_code:write forms:read forms:write pages:read pages:write sites:read sites:write');
    });
  });
});