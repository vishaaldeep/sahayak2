const express = require('express');
const router = express.Router();
const walletController = require('../controller/walletController');
const { requireAuth } = require('../middleware/auth');

router.get('/', requireAuth, walletController.getWallet);
router.get('/transactions', requireAuth, walletController.getTransactions);
router.post('/add', requireAuth, walletController.addMoney);
router.post('/verify', requireAuth, walletController.verifyPayment);
router.put('/savings-goal', requireAuth, walletController.updateSavingsGoal);
router.post('/create', requireAuth, walletController.createWallet);

module.exports = router;