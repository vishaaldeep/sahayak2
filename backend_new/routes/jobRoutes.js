const express = require('express');
const router = express.Router();
const jobController = require('../controller/jobController');

router.get('/', jobController.getAllJobs);
router.post('/', jobController.createJob);
router.get('/jobs-in-radius', jobController.getJobsInRadius);
router.get('/employer/:employerId', jobController.getJobsByEmployer);

module.exports = router;
