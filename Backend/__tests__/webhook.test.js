const request = require('supertest');
const express = require('express');
const crypto = require('crypto');
const { verifyPaystackWebhook, jsonParserWithRawBody } = require('../middleware/verifyWebhook');

// Mock environment
process.env.PAYSTACK_SECRET_KEY = 'sk_test_1234567890abcdef';

describe('Webhook Signature Verification', () => {
  let app;
  
  beforeEach(() => {
    app = express();
    app.use(jsonParserWithRawBody);
    app.post('/webhook', verifyPaystackWebhook, (req, res) => {
      res.json({ 
        success: true, 
        event: req.body.event, 
        reference: req.body.data?.reference,
        bodyReceived: !!req.body.event && !!req.body.data
      });
    });
  });

  test('should accept valid webhook with correct signature', async () => {
    const testPayload = {
      event: 'charge.success',
      data: {
        reference: 'REF_123456',
        amount: 5000,
        customer: { email: 'test@example.com' }
      }
    };

    const payloadString = JSON.stringify(testPayload);
    const signature = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
      .update(payloadString)
      .digest('hex');

    const response = await request(app)
      .post('/webhook')
      .set('x-paystack-signature', signature)
      .send(testPayload)
      .expect(200);

    console.log('✅ Valid webhook test output:', response.body);
    expect(response.body.success).toBe(true);
    expect(response.body.event).toBe('charge.success');
    expect(response.body.reference).toBe('REF_123456');
    expect(response.body.bodyReceived).toBe(true);
  });

  test('should reject webhook with invalid signature', async () => {
    const testPayload = {
      event: 'charge.success',
      data: { reference: 'REF_123456' }
    };

    const response = await request(app)
      .post('/webhook')
      .set('x-paystack-signature', 'invalid_signature')
      .send(testPayload)
      .expect(401);

    console.log('✅ Invalid signature test output:', response.body);
    expect(response.body.message).toBe('Invalid signature');
  });

  test('should reject webhook without signature', async () => {
    const testPayload = {
      event: 'charge.success',
      data: { reference: 'REF_123456' }
    };

    const response = await request(app)
      .post('/webhook')
      .send(testPayload)
      .expect(401);

    console.log('✅ Missing signature test output:', response.body);
    expect(response.body.message).toBe('Invalid signature');
  });

  test('should reject oversized payloads', async () => {
    // Create a payload larger than 100kb
    const largePayload = {
      event: 'charge.success',
      data: { reference: 'REF_123456' }
    };
    
    // Add large array to exceed 100kb limit
    largePayload.data.largeArray = new Array(200000).fill('x').join('');

    const response = await request(app)
      .post('/webhook')
      .set('x-paystack-signature', 'any_signature')
      .send(largePayload)
      .expect(413);

    console.log('✅ Oversized payload test output:', response.body);
  });
});
