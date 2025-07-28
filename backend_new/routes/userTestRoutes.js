const express = require('express');
const router = express.Router();
const userTestController = require('../controller/userTestController');

router.post('/assign', userTestController.assignTest);
router.patch('/:testId/complete', userTestController.completeTest);

module.exports = router; 