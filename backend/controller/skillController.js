
const Skill = require('../Model/skillSchema');

// Create a new skill
exports.createSkill = async (req, res) => {
  try {
    const skill = new Skill(req.body);
    await skill.save();
    res.status(201).send(skill);
  } catch (error) {
    res.status(400).send(error);
  }
};

// Get all skills
exports.getAllSkills = async (req, res) => {
  try {
    const skills = await Skill.find({});
    res.status(200).send(skills);
  } catch (error) {
    res.status(500).send(error);
  }
};

// Get skill by ID
exports.getSkillById = async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);
    if (!skill) {
      return res.status(404).send();
    }
    res.status(200).send(skill);
  } catch (error) {
    res.status(500).send(error);
  }
};

// Update skill by ID
exports.updateSkill = async (req, res) => {
  try {
    const skill = await Skill.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!skill) {
      return res.status(404).send();
    }
    res.status(200).send(skill);
  } catch (error) {
    res.status(400).send(error);
  }
};

// Delete skill by ID
exports.deleteSkill = async (req, res) => {
  try {
    const skill = await Skill.findByIdAndDelete(req.params.id);
    if (!skill) {
      return res.status(404).send();
    }
    res.status(200).send(skill);
  } catch (error) {
    res.status(500).send(error);
  }
};
