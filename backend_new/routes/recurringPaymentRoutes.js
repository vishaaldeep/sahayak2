const express = require('express');
const router = express.Router();
const recurringPaymentController = require('../controller/recurringPaymentController');

// Create a new recurring payment
router.post('/', recurringPaymentController.createRecurringPayment);

// Get all recurring payments for a specific employer
router.get('/employer/:employer_id', recurringPaymentController.getEmployerRecurringPayments);

// Get all recurring payments for a specific seeker
router.get('/seeker/:seeker_id', recurringPaymentController.getSeekerRecurringPayments);

// Update recurring payment status (e.g., from Decentro webhook)
router.put('/:id', recurringPaymentController.updateRecurringPaymentStatus);

module.exports = router;
