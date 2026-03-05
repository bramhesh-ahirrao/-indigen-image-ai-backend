const express = require('express');
const {
  getTokenPackages,
  createOrder,
  verifyPayment,
  getPaymentHistory,
  handleWebhook
} = require('../controllers/paymentController');
const auth = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/packages', getTokenPackages);

// Protected routes
router.post('/create-order', auth, createOrder);
router.post('/verify', auth, verifyPayment);
router.get('/history', auth, getPaymentHistory);

// Webhook (public)
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

module.exports = router;