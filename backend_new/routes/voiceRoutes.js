
const express = require('express');
const router = express.Router();
const voiceController = require('../controller/voiceController');

router.post('/command', voiceController.handleCommand);

module.exports = router;
