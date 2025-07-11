
const UserSkill = require('../Model/userSkills');

// Create a new user skill
exports.createUserSkill = async (req, res) => {
  try {
    const userSkill = new UserSkill(req.body);
    await userSkill.save();
    res.status(201).send(userSkill);
  } catch (error) {
    res.status(400).send(error);
  }
};

// Get all user skills
exports.getAllUserSkills = async (req, res) => {
  try {
    const userSkills = await UserSkill.find({});
    res.status(200).send(userSkills);
  } catch (error) {
    res.status(500).send(error);
  }
};

// Get user skill by ID
exports.getUserSkillById = async (req, res) => {
  try {
    const userSkill = await UserSkill.findById(req.params.id);
    if (!userSkill) {
      return res.status(404).send();
    }
    res.status(200).send(userSkill);
  } catch (error) {
    res.status(500).send(error);
  }
};

// Update user skill by ID
exports.updateUserSkill = async (req, res) => {
  try {
    const userSkill = await UserSkill.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!userSkill) {
      return res.status(404).send();
    }
    res.status(200).send(userSkill);
  } catch (error) {
    res.status(400).send(error);
  }
};

// Delete user skill by ID
exports.deleteUserSkill = async (req, res) => {
  try {
    const userSkill = await UserSkill.findByIdAndDelete(req.params.id);
    if (!userSkill) {
      return res.status(404).send();
    }
    res.status(200).send(userSkill);
  } catch (error) {
    res.status(500).send(error);
  }
};
