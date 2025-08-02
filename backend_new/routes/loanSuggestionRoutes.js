
const express = require('express');
const router = express.Router();
const LoanSuggestion = require('../Model/LoanSuggestion');
const { requireAuth } = require('../middleware/auth');

// Get loan suggestions for a specific user
router.get('/user/:userId', requireAuth, async (req, res) => {
  try {
    const suggestions = await LoanSuggestion.find({ userId: req.params.userId }).sort({ timestamp: -1 });
    res.status(200).json(suggestions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
