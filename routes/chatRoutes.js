const express = require('express');
const chatController = require('../controllers/chatController');
const userAuthentication = require('../middlewares/auth');

const router = express.Router();

router.get('/', chatController.getChatPage);
router.get('/getChat', userAuthentication.authenticate, chatController.getChat);
router.post('/sendChat', userAuthentication.authenticate, chatController.sendChat); 

module.exports = router;