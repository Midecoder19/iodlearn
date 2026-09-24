const crypto = require('crypto');
const express = require('express');

/**
 * Verify Paystack webhook signature
 * Paystack signs webhooks with HMAC-SHA512 of the raw request body
 * using the PAYSTACK_SECRET_KEY as the signing key
 */
const verifyPaystackWebhook = (req, res, next) => {
  const signature = req.headers['x-paystack-signature'];
  const secret = process.env.PAYSTACK_SECRET_KEY;

  if (!signature) {
    console.error('Webhook signature missing');
    return res.status(401).json({ message: 'Invalid signature' });
  }

  if (!secret) {
    console.error('PAYSTACK_SECRET_KEY not configured');
    return res.status(500).json({ message: 'Server configuration error' });
  }

  // Use the raw body that was captured by express.json verify function
  const rawBody = req.rawBody;

  if (!rawBody) {
    console.error('Raw body not captured for webhook verification');
    return res.status(500).json({ message: 'Server configuration error' });
  }

  // Compute HMAC-SHA512 of the raw body
  const expectedSignature = crypto
    .createHmac('sha512', secret)
    .update(rawBody)
    .digest('hex');

  // Use timing-safe comparison to prevent timing attacks
  try {
    const signatureBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (signatureBuffer.length !== expectedBuffer.length) {
      console.error('Webhook signature length mismatch');
      return res.status(401).json({ message: 'Invalid signature' });
    }

    const isValid = crypto.timingSafeEqual(signatureBuffer, expectedBuffer);

    if (!isValid) {
      console.error('Webhook signature verification failed');
      return res.status(401).json({ message: 'Invalid signature' });
    }

    // Signature is valid, proceed to process webhook
    next();
  } catch (error) {
    console.error('Webhook signature verification error:', error);
    return res.status(401).json({ message: 'Invalid signature' });
  }
};

/**
 * Express JSON parser with raw body capture for webhook signature verification
 * This captures the raw bytes AND parses the body in one pass
 */
const jsonParserWithRawBody = express.json({
  limit: '100kb', // Size limit to prevent memory exhaustion
  verify: (req, res, buf) => {
    req.rawBody = buf; // Capture raw body for signature verification
  }
});

module.exports = {
  verifyPaystackWebhook,
  jsonParserWithRawBody
};
