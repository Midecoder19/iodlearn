const request = require('supertest');
const express = require('express');

// Simple test app with health endpoint
const createTestApp = () => {
  const app = express();
  
  app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date() });
  });

  app.get('/api/auth/health', (req, res) => {
    res.json({ status: 'OK', service: 'auth' });
  });

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: `Route ${req.method} ${req.path} not found`
    });
  });

  // Error handler
  app.use((err, req, res, next) => {
    res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Server error'
    });
  });

  return app;
};

describe('Health Endpoints', () => {
  let app;

  beforeEach(() => {
    app = createTestApp();
  });

  describe('GET /health', () => {
    it('should return 200 with status OK', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('timestamp');
    });

    it('should have valid JSON response structure', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(typeof response.body.status).toBe('string');
      expect(response.body.timestamp).toBeTruthy();
    });
  });

  describe('GET /api/auth/health', () => {
    it('should return auth service health status', async () => {
      const response = await request(app)
        .get('/api/auth/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('service', 'auth');
    });
  });

  describe('404 Handling', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(app)
        .get('/api/unknown/route')
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('Content-Type', () => {
    it('should return JSON content type', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.type).toBe('application/json');
    });
  });
});
