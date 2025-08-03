const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');
const { requireAuth } = require('../middleware/auth');

router.post('/signup', userController.signup);
router.post('/login', userController.login);
router.get('/profile', requireAuth, userController.getProfile);
router.put('/profile', requireAuth, userController.updateProfile);
router.put('/update-language', requireAuth, userController.updateLanguage);
router.get('/me', requireAuth, userController.getCurrentUser);
router.put('/change-language', requireAuth, userController.changeLanguage);
router.put('/profile/notifications', requireAuth, userController.updateNotificationSettings);
router.get('/seekers', userController.getAllSeekers);
router.get('/:id', userController.getUserById);

module.exports = router;