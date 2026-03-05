const express = require('express');
const {
  generateImage,
  generateVideo,
  generateText,
  getTokenBalance
} = require('../controllers/aiController');
const auth = require('../middleware/auth');

const router = express.Router();

// All AI routes require authentication
router.post('/generate-image', auth, generateImage);
router.post('/generate-video', auth, generateVideo);
router.post('/generate-text', auth, generateText);
router.get('/balance', auth, getTokenBalance);

module.exports = router;