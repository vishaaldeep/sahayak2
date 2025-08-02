const express = require('express');
const router = express.Router();
const userBankDetailsController = require('../controller/userBankDetailsController');

// Create or update user bank details
router.post('/', userBankDetailsController.createOrUpdateUserBankDetails);

// Get user bank details by user_id
router.get('/:user_id', userBankDetailsController.getUserBankDetails);

module.exports = router;
