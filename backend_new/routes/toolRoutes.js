const express = require('express');
const router = express.Router();
const toolController = require('../controller/toolController');
const { requireAuth } = require('../middleware/auth');

// Public routes
router.get('/', toolController.getAllTools);
router.get('/my-tools/:userId', requireAuth, toolController.getMyTools);
router.get('/:id', toolController.getToolById);

// Protected routes (require authentication)
router.post('/', requireAuth, toolController.createTool);
router.put('/:id', requireAuth, toolController.updateTool);
router.delete('/:id', requireAuth, toolController.deleteTool);

module.exports = router;
