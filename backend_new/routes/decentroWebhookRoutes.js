const express = require('express');
const router = express.Router();
const decentroWebhookController = require('../controller/decentroWebhookController');

// Endpoint for Decentro webhooks
router.post('/status', decentroWebhookController.handleDecentroWebhook);

module.exports = router;
