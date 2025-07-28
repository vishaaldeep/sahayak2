
const express = require('express');
const router = express.Router();
const userSkillController = require('../controller/userSkillController');
const auth = require('../middleware/auth');
// Placeholder for role-based middleware
const requireSeeker = (req, res, next) => { if (req.user && req.user.roleType === 'job seeker') return next(); return res.status(403).json({ error: 'Only job seekers can modify skills.' }); };

// CRUD
router.get('/', auth, userSkillController.getSkills); // all skills for user
router.post('/', auth, requireSeeker, userSkillController.addSkill);
router.put('/:id', auth, requireSeeker, userSkillController.updateSkill);
router.delete('/delete-skill/:id', auth, requireSeeker, userSkillController.deleteSkill);

// Verification
router.post('/:id/upload-certificate', auth, requireSeeker, userSkillController.uploadCertificate);
router.post('/:id/fetch-pcc', auth, requireSeeker, userSkillController.fetchPCCFromDigiLocker);
router.post('/:id/fetch-certificate', auth, requireSeeker, userSkillController.fetchCertificateFromDigiLocker);
router.post('/:id/trigger-assessment', auth, requireSeeker, userSkillController.triggerAssessment);
router.post('/:id/assessment-result', auth, requireSeeker, userSkillController.setAssessmentResult);

module.exports = router;
