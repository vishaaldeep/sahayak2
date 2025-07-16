
// const express = require('express');
// const router = express.Router();
// const jobController = require('../controller/jobController');

// router.post('/jobs', jobController.createJob);
// router.get('/jobs', jobController.getAllJobs);
// router.get('/jobs/search', jobController.searchJobs);
// router.get('/jobs/:id', jobController.getJobById);
// router.put('/jobs/:id', jobController.updateJob);
// router.delete('/jobs/:id', jobController.deleteJob);

// module.exports = router;

const express = require('express');
const router = express.Router();
const jobController = require('../controller/jobController');

router.post('/jobs', jobController.createJob);
router.get('/jobs/search', jobController.searchJobs); 
router.get('/jobs', jobController.getAllJobs);
router.get('/jobs-in-bounds', jobController.getJobsInBounds);
router.get('/jobs-in-radius', jobController.getJobsInRadius);
// router.get('/jobs/:id', jobController.getJobById);
// router.put('/jobs/:id', jobController.updateJob);
// router.delete('/jobs/:id', jobController.deleteJob);

module.exports = router;

