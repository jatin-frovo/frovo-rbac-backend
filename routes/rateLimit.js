const express = require('express');
const { getRateLimitStatus } = require('../controllers/rateLimitController');

const router = express.Router();

router.get('/status', getRateLimitStatus);

module.exports = router;