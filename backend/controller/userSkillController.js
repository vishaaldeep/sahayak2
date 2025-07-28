
const UserSkill = require('../Model/userSkills');

// Helper: Calculate skill score
function calculateSkillScore(skill) {
  let score = 0;
  if (skill.pcc_status === 'verified') score += 30;
  if (skill.assessment_status === 'passed') score += 30;
  if (skill.certificates && skill.certificates.length > 0) score += 20;
  if (skill.experience_years) score += Math.min(skill.experience_years * 5, 10);
  if (skill.feedback_score) score += Math.min(skill.feedback_score, 10);
  return Math.min(score, 100);
}

// Helper: Calculate progress
function calculateProgress(skill) {
  let progress = 0;
  if (skill.pcc_status === 'verified') progress++;
  if (skill.assessment_status === 'passed' || skill.assessment_status === 'not_required') progress++;
  if (skill.certificates && skill.certificates.length > 0) progress++;
  return progress;
}

// GET all skills for user
exports.getSkills = async (req, res) => {
  const user_id = req.user._id;
  const skills = await UserSkill.find({ user_id });
  res.json(skills);
};

// ADD skill
exports.addSkill = async (req, res) => {
  const { skill_name, category, experience_years } = req.body;
  const user_id = req.user._id;
  const skill = new UserSkill({
    user_id, skill_name, category, experience_years,
    pcc_status: 'pending', assessment_status: 'pending', verified: false
  });
  skill.skill_score = calculateSkillScore(skill);
  skill.progress = calculateProgress(skill);
  await skill.save();
  res.status(201).json(skill);
};

// UPDATE skill
exports.updateSkill = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const skill = await UserSkill.findByIdAndUpdate(id, updates, { new: true });
  skill.skill_score = calculateSkillScore(skill);
  skill.progress = calculateProgress(skill);
  await skill.save();
  res.json(skill);
};

// DELETE skill
exports.deleteSkill = async (req, res) => {
  const { id } = req.params;
  await UserSkill.findByIdAndDelete(id);
  res.json({ success: true });
};

// UPLOAD certificate (simulate file upload)
exports.uploadCertificate = async (req, res) => {
  const { id } = req.params;
  // Simulate file upload: req.body.url, req.body.type
  const skill = await UserSkill.findById(id);
  skill.certificates.push({
    url: req.body.url,
    type: req.body.type || 'certificate',
    source: 'upload'
  });
  skill.skill_score = calculateSkillScore(skill);
  skill.progress = calculateProgress(skill);
  await skill.save();
  res.json(skill);
};

// Simulate DigiLocker PCC fetch
exports.fetchPCCFromDigiLocker = async (req, res) => {
  const { id } = req.params;
  const skill = await UserSkill.findById(id);
  skill.pcc_status = 'verified';
  skill.certificates.push({
    url: 'https://digilocker.gov.in/fake-pcc.pdf',
    type: 'pcc',
    source: 'digilocker'
  });
  skill.skill_score = calculateSkillScore(skill);
  skill.progress = calculateProgress(skill);
  await skill.save();
  res.json(skill);
};

// Simulate DigiLocker certificate fetch
exports.fetchCertificateFromDigiLocker = async (req, res) => {
  const { id } = req.params;
  const skill = await UserSkill.findById(id);
  skill.certificates.push({
    url: 'https://digilocker.gov.in/fake-certificate.pdf',
    type: 'certificate',
    source: 'digilocker'
  });
  skill.skill_score = calculateSkillScore(skill);
  skill.progress = calculateProgress(skill);
  await skill.save();
  res.json(skill);
};

// Trigger assessment (simulate)
exports.triggerAssessment = async (req, res) => {
  const { id } = req.params;
  const skill = await UserSkill.findById(id);
  skill.assessment_status = 'pending';
  await skill.save();
  res.json({ message: 'Assessment started' });
};

// Set assessment result
exports.setAssessmentResult = async (req, res) => {
  const { id } = req.params;
  const { result } = req.body; // 'passed' or 'failed'
  const skill = await UserSkill.findById(id);
  skill.assessment_status = result;
  skill.skill_score = calculateSkillScore(skill);
  skill.progress = calculateProgress(skill);
  await skill.save();
  res.json(skill);
};
