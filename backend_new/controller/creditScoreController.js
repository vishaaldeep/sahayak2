const CreditScore = require('../Model/creditScore');

exports.getCreditScore = async (req, res) => {
  try {
    const creditScore = await CreditScore.findOne({ userId: req.params.userId });
    if (!creditScore) {
      return res.status(404).json({ message: 'Credit score not found' });
    }
    res.status(200).json(creditScore);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};