const express = require('express');
const router = express.Router();
const paymentController = require('../controller/paymentController');
const { requireAuth } = require('../middleware/auth');

router.post('/fund-wallet/upi', requireAuth, paymentController.fundWalletUpi);
router.post('/withdraw-wallet/upi', requireAuth, paymentController.withdrawWalletUpi);
router.post('/create-decentro-wallet', requireAuth, paymentController.createDecentroWallet);

module.exports = router;