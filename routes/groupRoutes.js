const express = require('express');
const groupController = require('../controllers/groupController');
const userAuthentication = require('../middlewares/auth');

const router = express.Router();

router.post('/createGroup', userAuthentication.authenticate, groupController.createGroup);
router.get('/getAllGroups', userAuthentication.authenticate, groupController.getAllGroups);
router.get('/getGroupMembers/:groupId', userAuthentication.authenticate, groupController.getGroupMembers);
router.get('/getUnaddedUsers/:groupId', userAuthentication.authenticate, groupController.getUnaddedUsers);
router.post('/addUserToGroup/:groupId/:userId', userAuthentication.authenticate, groupController.addUserToGroup);
router.delete('/leaveGroup/:groupId', userAuthentication.authenticate, groupController.leaveGroup);

module.exports = router;