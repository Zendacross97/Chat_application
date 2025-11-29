const express = require('express');
const chatController = require('../controllers/chatController');
const userAuthentication = require('../middlewares/auth');
const multer = require('multer');// import multer for handling multipart/form-data
const upload = multer();// configure multer (you can customize storage options as needed)

const router = express.Router();

router.get('/', chatController.getChatPage);
router.get('/getChats/:id', userAuthentication.authenticate, chatController.getChat);
router.post('/sendChat/:id', userAuthentication.authenticate, upload.single('media'), chatController.sendChat);
router.get('/getPredictiveTyping', userAuthentication.authenticate, chatController.getPredictiveTyping);
router.get('/getSmartReplies', userAuthentication.authenticate, chatController.getSmartReplies);

module.exports = router;