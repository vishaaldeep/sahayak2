const express = require('express');
const router = express.Router();
const jobApplicationController = require('../controller/jobApplicationController');
const auth = require('../middleware/auth');

// Apply for a job (job seekers)
router.post('/apply', auth, jobApplicationController.applyForJob);

// Get user's applications (job seekers)
router.get('/my-applications', auth, jobApplicationController.getUserApplications);

// Get applications for a job (job providers)
router.get('/job/:job_id', auth, jobApplicationController.getJobApplications);

// Hire an applicant (job providers)
router.put('/hire/:application_id', auth, jobApplicationController.hireApplicant);

// Reject an applicant (job providers)
router.put('/reject/:application_id', auth, jobApplicationController.rejectApplicant);

module.exports = router;