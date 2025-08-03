const express = require('express');
const router = express.Router();
const userSkillController = require('../controller/userSkillController');

router.get('/:userId', userSkillController.getUserSkills);
router.post('/:userId', userSkillController.addUserSkill);
router.delete('/delete-skill/:skillId', userSkillController.removeUserSkill);
// router.delete('/:userId/:skillId', userSkillController.removeUserSkill); // Deprecated, replaced by above
router.patch('/:userId/:skillId/verify', userSkillController.verifyUserSkill);

// Assessment and verification routes
router.post('/:skillId/upload-certificate', userSkillController.uploadCertificate);
router.post('/:skillId/fetch-pcc', userSkillController.fetchPCCFromDigiLocker);
router.post('/:skillId/fetch-certificate', userSkillController.fetchCertificateFromDigiLocker);
router.post('/:skillId/trigger-assessment', userSkillController.triggerAssessment);
router.post('/:skillId/assessment-result', userSkillController.setAssessmentResult);

module.exports = router; 