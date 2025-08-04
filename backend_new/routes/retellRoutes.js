const express = require('express');
const router = express.Router();
const { handleRetellAuth } = require('../controller/retellController');

// Debug route to test if routes are working
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Retell routes are working!', 
    timestamp: new Date().toISOString(),
    route: '/api/retell/test'
  });
});

// Main auth route
router.post('/auth', handleRetellAuth);

// Add a GET route for testing
router.get('/auth', (req, res) => {
  res.json({ 
    message: 'Retell auth endpoint is available. Use POST method to create a call.',
    methods: ['POST'],
    endpoint: '/api/retell/auth'
  });
});

module.exports = router;