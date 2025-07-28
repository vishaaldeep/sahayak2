const userSkillService = require('../services/userSkillService');

exports.getUserSkills = async (req, res) => {
  const skills = await userSkillService.getUserSkills(req.params.userId);
  res.json(skills);
};
exports.addUserSkill = async (req, res) => {
  const skill = await userSkillService.addUserSkill(req.params.userId, req.body);
  res.status(201).json(skill);
};
exports.removeUserSkill = async (req, res) => {
  await userSkillService.removeUserSkill(req.params.skillId);
  res.json({ success: true });
};
exports.verifyUserSkill = async (req, res) => {
  const skill = await userSkillService.verifyUserSkill(req.params.userId, req.params.skillId);
  res.json(skill);
}; 