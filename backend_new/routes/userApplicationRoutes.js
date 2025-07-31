const express = require('express');
const router = express.Router();
const userApplicationController = require('../controller/userApplicationController');

console.log('userApplicationRoutes loaded');

router.post('/', userApplicationController.createApplication);
router.put('/:id', userApplicationController.updateApplicationStatus);
router.get('/employer/:employerId', userApplicationController.getApplicationsByEmployer);
router.get('/seeker/:seekerId', userApplicationController.getApplicationsBySeeker);

module.exports = router;
