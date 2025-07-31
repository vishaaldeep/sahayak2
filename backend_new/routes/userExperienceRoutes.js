const express = require('express');
const router = express.Router();
const userExperienceController = require('../controller/userExperienceController');
const { requireAuth, authorizeRoles } = require('../middleware/auth');



router.post('/', requireAuth, authorizeRoles('seeker'), userExperienceController.addExperience);
router.get('/current-jobs/:seekerId', requireAuth, authorizeRoles('seeker'), userExperienceController.getCurrentJobs);
router.put('/leave-job/:experienceId', requireAuth, authorizeRoles('seeker'), userExperienceController.leaveJob);
router.post('/raise-issue/:experienceId', requireAuth, authorizeRoles('seeker'), userExperienceController.raiseIssue);

module.exports = router;