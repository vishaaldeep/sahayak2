
const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');

router.post('/users/login', userController.login);
router.post('/users', userController.createUser);
router.get('/users', userController.getAllUsers);
router.get('/users/:id', userController.getUserById);
router.put('/users/:id', userController.updateUser);
router.delete('/users/:id', userController.deleteUser);

module.exports = router;
