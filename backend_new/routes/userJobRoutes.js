const express = require('express');
const router = express.Router();
const userJobController = require('../controller/userJobController');

// Seeker routes
router.post('/apply', userJobController.applyForJob);
router.post('/negotiate', userJobController.negotiateOffer);
router.post('/recommend', userJobController.recommendJob);

// Provider routes
router.get('/applications/:job_id', userJobController.viewApplications);
router.post('/make-offer', userJobController.makeOffer);

module.exports = router;
