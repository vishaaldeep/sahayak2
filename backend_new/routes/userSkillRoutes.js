const express = require('express');
const router = express.Router();
const userSkillController = require('../controller/userSkillController');

router.get('/:userId', userSkillController.getUserSkills);
router.post('/:userId', userSkillController.addUserSkill);
router.delete('/delete-skill/:skillId', userSkillController.removeUserSkill);
// router.delete('/:userId/:skillId', userSkillController.removeUserSkill); // Deprecated, replaced by above
router.patch('/:userId/:skillId/verify', userSkillController.verifyUserSkill);

module.exports = router; 