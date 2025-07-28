const userService = require('../services/userService');
const UserRating = require('../Model/UserRating');
const Seeker = require('../Model/Seeker');
const Employer = require('../Model/Employer');
const employerService = require('../services/employerService');
const jwt = require('jsonwebtoken');
const walletService = require('../services/walletService');

exports.signup = async (req, res) => {
  try {
    const user = await userService.createUser(req.body);
    if (user.role === 'seeker') {
      await Seeker.create({ user_id: user._id });
      await walletService.createWallet(user._id);
    } else if (user.role === 'provider') {
      // Assuming req.body contains necessary employer details like company_name, company_type, gstin_number
      await employerService.createEmployerProfile(user._id, req.body.company_name, req.body.company_type, req.body.gstin_number, req.body.investor_history);
      await walletService.createWallet(user._id);
    }
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ user, token });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  const { phone_number, password } = req.body;
  const user = await userService.findByPhone(phone_number);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const valid = await userService.comparePassword(user, password);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ user, token });
};

exports.getProfile = async (req, res) => {
  const user = await userService.findById(req.user._id);
  const ratings = await UserRating.find({ receiver_user_id: user._id });
  const avgRating = ratings.length ? (ratings.reduce((a, b) => a + b.rating, 0) / ratings.length) : null;
  res.json({ ...user.toObject(), avgRating });
};

exports.updateProfile = async (req, res) => {
  const user = await userService.updateUser(req.user._id, req.body);
  res.json(user);
};

exports.changeLanguage = async (req, res) => {
  const user = await userService.updateUser(req.user._id, { language: req.body.language });
  res.json(user);
};

exports.updateNotificationSettings = async (req, res) => {
  const user = await userService.updateUser(req.user._id, { notification_settings: req.body });
  res.json(user);
}; 