const express = require('express');
const router = express.Router();
const jobController = require('../controller/jobController');
const { authenticateToken, requireEmployer, requireResourceOwnership } = require('../middleware/authMiddleware');

// Public routes (for seekers to view jobs)
router.get('/', jobController.getAllJobs);
router.get('/jobs-in-radius', jobController.getJobsInRadius);
router.get('/employer/:employerId/public', jobController.getPublicJobsByEmployer);

// Protected routes
router.post('/', authenticateToken, requireEmployer, jobController.createJob);
router.get('/employer/:employerId', authenticateToken, requireResourceOwnership('employerId'), jobController.getJobsByEmployer);

module.exports = router;
