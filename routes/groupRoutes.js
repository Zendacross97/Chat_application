const express = require('express');
const groupController = require('../controllers/groupController');
const userAuthentication = require('../middlewares/auth');

const router = express.Router();

router.post('/createGroup', userAuthentication.authenticate, groupController.createGroup);
router.get('/getAllGroups', userAuthentication.authenticate, groupController.getAllGroups);
router.post('/addUserToGroup/:groupId', userAuthentication.authenticate, groupController.addUserToGroup);
router.post('/removeUserFromGroup/:groupId', userAuthentication.authenticate, groupController.removeUserFromGroup);
router.post('/promoteMembers/:groupId', userAuthentication.authenticate, groupController.promoteToAdmin);
router.post('/demoteMembers/:groupId', userAuthentication.authenticate, groupController.demoteFromAdmin);
router.delete('/leaveGroup/:groupId', userAuthentication.authenticate, groupController.leaveGroup);
router.delete('/delete_group/:groupId', userAuthentication.authenticate, groupController.deleteGroup);

module.exports = router;