const express = require('express');
const router = express.Router();
const {
  createRecurringPayment,
  getEmployerRecurringPayments,
  getEmployeeRecurringPayments,
  updateRecurringPaymentStatus,
  getPaymentHistory,
  triggerManualPayment
} = require('../controller/mockRecurringPaymentController');
const { authenticateToken, requireEmployer, requireSeeker } = require('../middleware/authMiddleware');

// Employer routes
router.post('/create', authenticateToken, requireEmployer, createRecurringPayment);
router.get('/employer', authenticateToken, requireEmployer, getEmployerRecurringPayments);
router.put('/:id/status', authenticateToken, requireEmployer, updateRecurringPaymentStatus);
router.post('/:id/trigger', authenticateToken, requireEmployer, triggerManualPayment);

// Employee routes
router.get('/employee', authenticateToken, requireSeeker, getEmployeeRecurringPayments);

// Shared routes (both employer and employee can access)
router.get('/:id/history', authenticateToken, getPaymentHistory);

module.exports = router;