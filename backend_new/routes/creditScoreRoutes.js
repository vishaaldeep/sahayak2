const express = require('express');
const router = express.Router();
const creditScoreController = require('../controller/creditScoreController');
const { requireAuth } = require('../middleware/auth');

router.get('/:userId', requireAuth, creditScoreController.getCreditScore);

module.exports = router