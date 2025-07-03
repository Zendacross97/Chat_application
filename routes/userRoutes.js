const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

router.post('/signUp', userController.signUp);
router.get('/login', userController.getLoginPage);
router.post('/login', userController.logIn);

module.exports = router;