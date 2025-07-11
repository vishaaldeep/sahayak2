
const express = require('express');
const router = express.Router();
const userSkillController = require('../controller/userSkillController');

router.post('/userSkills', userSkillController.createUserSkill);
router.get('/userSkills', userSkillController.getAllUserSkills);
router.get('/userSkills/:id', userSkillController.getUserSkillById);
router.put('/userSkills/:id', userSkillController.updateUserSkill);
router.delete('/userSkills/:id', userSkillController.deleteUserSkill);

module.exports = router;
