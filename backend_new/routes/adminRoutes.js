const express = require('express');
const router = express.Router();
const adminController = require('../controller/adminController');
const { requireAuth, authorizeRoles } = require('../middleware/auth');

// Apply authentication and admin check to all routes
router.use(requireAuth);
router.use(authorizeRoles('admin'));

// CSV Jobs Management Routes
router.get('/csv-jobs', adminController.getCSVJobs);
router.post('/import-csv-jobs', adminController.importCSVJobs);

// Jobs Management Routes
router.get('/jobs-stats', adminController.getImportedJobsStats);
router.get('/jobs', adminController.getImportedJobs);
router.delete('/jobs', adminController.deleteImportedJobs);
router.put('/jobs/:jobId/status', adminController.updateJobStatus);

module.exports = router;