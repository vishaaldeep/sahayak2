const express = require('express');
const router = express.Router();
const ratingController = require('../controller/ratingController');
const { requireAuth } = require('../middleware/auth');

router.post('/', requireAuth, ratingController.createOrUpdateRating);
router.get('/:jobId/:giverId/:receiverId', requireAuth, ratingController.getRating);

module.exports = router;