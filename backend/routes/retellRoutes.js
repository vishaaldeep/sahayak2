
const express = require('express');
const router = express.Router();
const { handleRetellAuth } = require('../controller/retellController');

router.post('/auth', handleRetellAuth);

module.exports = router;
