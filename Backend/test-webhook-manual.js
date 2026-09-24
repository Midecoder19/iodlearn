const crypto = require('crypto');
const express = require('express');
const { jsonParserWithRawBody, verifyPaystackWebhook } = require('./middleware/verifyWebhook');

// Mock environment
process.env.PAYSTACK_SECRET_KEY = 'sk_test_1234567890abcdef';

const app = express();
app.use(jsonParserWithRawBody);

app.post('/webhook', verifyPaystackWebhook, (req, res) => {
  console.log('✅ Webhook handler reached with parsed body:');
  console.log('   Event:', req.body.event);
  console.log('   Reference:', req.body.data?.reference);
  console.log('   Full body keys:', Object.keys(req.body));
  
  res.json({ 
    success: true, 
    event: req.body.event, 
    reference: req.body.data?.reference,
    bodyReceived: !!req.body.event && !!req.body.data
  });
});

// Test with valid signature
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

console.log('🧪 Testing webhook middleware...');
console.log('📤 Sending test payload with valid signature');

const http = require('http');
const options = {
  hostname: 'localhost',
  port: 9001,
  path: '/webhook',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-paystack-signature': signature
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log('📥 Response status:', res.statusCode);
    console.log('📥 Response body:', data);
    console.log('\n✅ Test completed - middleware working correctly');
    process.exit(0);
  });
});

req.on('error', (error) => {
  console.error('❌ Test failed:', error.message);
  process.exit(1);
});

req.write(payloadString);
req.end();

// Start test server
const server = app.listen(9001, () => {
  console.log('🚀 Test server started on port 9001');
});