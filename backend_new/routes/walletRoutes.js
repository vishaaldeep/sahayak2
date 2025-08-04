const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const Wallet = require('../Model/Wallet');
const WalletTransaction = require('../Model/WalletTransaction');

// Root wallet route - returns wallet info and available endpoints
router.get('/', authenticateToken, async (req, res) => {
  console.log('🔍 Wallet root route accessed by user:', req.user._id);
  try {
    let wallet = await Wallet.findOne({ user_id: req.user._id });
    
    if (!wallet) {
      // Create wallet if it doesn't exist
      wallet = new Wallet({
        user_id: req.user._id,
        balance: 0
      });
      await wallet.save();
    }

    res.json({
      success: true,
      message: 'Wallet API endpoints',
      wallet: {
        balance: wallet.balance,
        monthly_savings_goal: wallet.monthly_savings_goal,
        wallet_id: wallet._id
      },
      available_endpoints: {
        balance: 'GET /api/wallet/balance',
        transactions: 'GET /api/wallet/transactions',
        transaction_by_id: 'GET /api/wallet/transactions/:transactionId',
        savings_goal: 'PUT /api/wallet/savings-goal',
        summary: 'GET /api/wallet/summary'
      }
    });
  } catch (error) {
    console.error('Error fetching wallet info:', error);
    res.status(500).json({ 
      error: 'Failed to fetch wallet info',
      details: error.message 
    });
  }
});

// Get wallet balance
router.get('/balance', authenticateToken, async (req, res) => {
  try {
    let wallet = await Wallet.findOne({ user_id: req.user._id });
    
    if (!wallet) {
      // Create wallet if it doesn't exist
      wallet = new Wallet({
        user_id: req.user._id,
        balance: 0
      });
      await wallet.save();
    }

    res.json({
      success: true,
      balance: wallet.balance,
      monthly_savings_goal: wallet.monthly_savings_goal,
      wallet_id: wallet._id
    });
  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    res.status(500).json({ 
      error: 'Failed to fetch wallet balance',
      details: error.message 
    });
  }
});

// Get wallet transactions
router.get('/transactions', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 50, type, status, category } = req.query;
    
    const filter = { user_id: req.user._id };
    
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (category) filter.category = category;

    const transactions = await WalletTransaction.find(filter)
      .sort({ created_at: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('job_id', 'title')
      .populate('employer_id', 'name email');

    const total = await WalletTransaction.countDocuments(filter);

    res.json({
      success: true,
      transactions,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(total / limit),
        total_transactions: total,
        per_page: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching wallet transactions:', error);
    res.status(500).json({ 
      error: 'Failed to fetch wallet transactions',
      details: error.message 
    });
  }
});

// Get transaction by ID
router.get('/transactions/:transactionId', authenticateToken, async (req, res) => {
  try {
    const transaction = await WalletTransaction.findOne({
      _id: req.params.transactionId,
      user_id: req.user._id
    })
    .populate('job_id', 'title')
    .populate('employer_id', 'name email');

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({
      success: true,
      transaction
    });
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({ 
      error: 'Failed to fetch transaction',
      details: error.message 
    });
  }
});

// Update monthly savings goal
router.put('/savings-goal', authenticateToken, async (req, res) => {
  try {
    const { monthly_savings_goal } = req.body;

    if (!monthly_savings_goal || monthly_savings_goal < 0) {
      return res.status(400).json({ error: 'Invalid savings goal amount' });
    }

    let wallet = await Wallet.findOne({ user_id: req.user._id });
    
    if (!wallet) {
      wallet = new Wallet({
        user_id: req.user._id,
        balance: 0,
        monthly_savings_goal
      });
    } else {
      wallet.monthly_savings_goal = monthly_savings_goal;
    }

    await wallet.save();

    res.json({
      success: true,
      message: 'Savings goal updated successfully',
      monthly_savings_goal: wallet.monthly_savings_goal
    });
  } catch (error) {
    console.error('Error updating savings goal:', error);
    res.status(500).json({ 
      error: 'Failed to update savings goal',
      details: error.message 
    });
  }
});

// Get wallet summary/stats
router.get('/summary', authenticateToken, async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ user_id: req.user._id });
    
    if (!wallet) {
      return res.json({
        success: true,
        summary: {
          current_balance: 0,
          total_credits: 0,
          total_debits: 0,
          transaction_count: 0,
          monthly_savings_goal: 0,
          recent_transactions: []
        }
      });
    }

    // Get transaction statistics
    const [creditStats, debitStats, recentTransactions] = await Promise.all([
      WalletTransaction.aggregate([
        { $match: { user_id: req.user._id, type: 'credit', status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
      ]),
      WalletTransaction.aggregate([
        { $match: { user_id: req.user._id, type: 'debit', status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
      ]),
      WalletTransaction.find({ user_id: req.user._id })
        .sort({ created_at: -1 })
        .limit(5)
        .populate('employer_id', 'name')
    ]);

    const totalCredits = creditStats[0]?.total || 0;
    const totalDebits = debitStats[0]?.total || 0;
    const creditCount = creditStats[0]?.count || 0;
    const debitCount = debitStats[0]?.count || 0;

    res.json({
      success: true,
      summary: {
        current_balance: wallet.balance,
        total_credits: totalCredits,
        total_debits: totalDebits,
        transaction_count: creditCount + debitCount,
        monthly_savings_goal: wallet.monthly_savings_goal,
        recent_transactions: recentTransactions
      }
    });
  } catch (error) {
    console.error('Error fetching wallet summary:', error);
    res.status(500).json({ 
      error: 'Failed to fetch wallet summary',
      details: error.message 
    });
  }
});

module.exports = router;