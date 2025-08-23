const express = require('express');
const userController = require('../controllers/userController');
const userAuthentication = require('../middlewares/auth');

const router = express.Router();

router.post('/signUp', userController.signUp);
router.get('/login', userController.getLoginPage);
router.post('/login', userController.logIn);
router.get('/getAllUsers', userAuthentication.authenticate, userController.getAllUsers);

module.exports = router;