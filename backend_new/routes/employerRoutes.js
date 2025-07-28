const express = require('express');
const router = express.Router();
const employerController = require('../controller/employerController');
const { requireAuth, authorizeRoles } = require('../middleware/auth');

// Create employer profile
router.post('/', requireAuth, authorizeRoles('provider'), employerController.createEmployerProfile);

// Get employer profile
router.get('/', requireAuth, authorizeRoles('provider'), employerController.getEmployerProfile);

// Update employer profile
router.put('/', requireAuth, authorizeRoles('provider'), employerController.updateEmployerProfile);

// Verify employer GSTIN (admin/internal use)
router.post('/verify-gstin', requireAuth, authorizeRoles('provider'), employerController.verifyEmployerGSTIN);

module.exports = router;