const groupServices = require('../services/groupServices');
const { v4: uuidv4 } = require('uuid');

exports.getAllGroups = async (req, res) => {
    try {
        const userId = req.user.id;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const groups = await groupServices.getAllGroups(userId);
        res.status(200).json(groups);
    } catch (error) {
        res.status(500).json({ error: error.message });
        console.log(error);
    }
}

exports.createGroup = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Group name is required' });
        }

        const userId = req.user.id;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const uuid = uuidv4();
        
        const group = await groupServices.createGroup(name, uuid, userId);
        
        res.status(201).json({ message: 'Group created successfully', group });
    } catch (error) {
        res.status(500).json({ error: error.message });
        console.log(error);
    }
}

exports.addUserToGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        if (!groupId) {
            return res.status(400).json({ error: 'Group ID and User ID are required' });
        }

        const { userIds } = req.body;
        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({ error: 'User IDs are required and should be an array' });
        }
        
        const currentUserId = req.user.id;
        if (!currentUserId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const adminCheck = await groupServices.isUserAdmin(groupId, currentUserId);
        if (!adminCheck) {
            return res.status(403).json({ error: 'Only admins can add members' });
        }

        const memberInGroup = await groupServices.isMemberInGroup(groupId, userIds);
        if (memberInGroup.notInGroup.length === 0) {
            return res.status(400).json({ error: 'User/s is/are already in the group' });
        }
        
        // Check if the group exists
        const user = await groupServices.addUserToGroup(groupId, memberInGroup.notInGroup);
        if (!user) {
            return res.status(404).json({ error: 'Group not found or user already in group' });
        }
        
        res.status(200).json(user, { message: 'User(s) added to group successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
        console.log(error);
    }
}

exports.removeUserFromGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        if (!groupId) {
            return res.status(400).json({ error: 'Group ID and User ID are required' });
        }
        const { userIds } = req.body;
        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({ error: 'User IDs are required and should be an array' });
        }
        const currentUserId = req.user.id;
        if (!currentUserId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const adminCheck = await groupServices.isUserAdmin(groupId, currentUserId);
        if (!adminCheck) {
            return res.status(403).json({ error: 'Only admins can remove members' });
        }
        const memberInGroup = await groupServices.isMemberInGroup(groupId, userIds);
        if (memberInGroup.inGroup.length === 0) {
            return res.status(400).json({ error: 'User/s is/are not in the group' });
        }
        const result = await groupServices.removeUserFromGroup(groupId, memberInGroup.inGroup);
        if (!result) {
            return res.status(404).json({ error: 'Group not found or user not in group' });
        }
        res.status(200).json(result, { message: 'User(s) removed from group successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
        console.log(error);
    }
}

exports.promoteToAdmin = async (req, res) => {
    try {
        const { groupId } = req.params;
        if (!groupId) {
            return res.status(400).json({ error: 'Group ID and User ID are required' });
        }
        const { userIds } = req.body;
        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({ error: 'User IDs are required and should be an array' });
        }
        const currentUserId = req.user.id;
        if (!currentUserId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const adminCheck = await groupServices.isUserAdmin(groupId, currentUserId);
        if (!adminCheck) {
            return res.status(403).json({ error: 'Only admins can promote members' });
        }
        const memberInGroup = await groupServices.isMemberInGroup(groupId, userIds);
        if (memberInGroup.inGroup.length === 0) {
            return res.status(400).json({ error: 'User/s is/are not in the group' });
        } 
        const memberIsAdmin = await Promise.all(memberInGroup.inGroup.map(id => groupServices.isUserAdmin(groupId, id)));
        if (memberIsAdmin.every(isAdmin => isAdmin)) {
            return res.status(400).json({ error: 'User/s is/are already admin(s)' });
        }
        // Get IDs of users who are not admin
        const promotableMembers = memberInGroup.inGroup.filter((id, idx) => !memberIsAdmin[idx]);
        console.log('Promotable Members:', promotableMembers);
        const result = await groupServices.promoteToAdmin(groupId, promotableMembers);
        if (!result) {
            return res.status(404).json({ error: 'Group not found or user not in group' });
        }
        res.status(200).json(result, { message: 'User(s) promoted to admin successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
        console.log(error);
    }
}

exports.demoteFromAdmin = async (req, res) => {
    try {
        const { groupId } = req.params;
        if (!groupId) {
            return res.status(400).json({ error: 'Group ID and User ID are required' });
        }
        const { userIds } = req.body;
        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({ error: 'User IDs are required and should be an array' });
        }
        const currentUserId = req.user.id;
        if (!currentUserId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const adminCheck = await groupServices.isUserAdmin(groupId, currentUserId);
        if (!adminCheck) {
            return res.status(403).json({ error: 'Only admins can demote members' });
        }
        const memberInGroup = await groupServices.isMemberInGroup(groupId, userIds);
        if (memberInGroup.inGroup.length === 0) {
            return res.status(400).json({ error: 'User/s is/are not in the group' });
        }
        const memberIsAdmin = await Promise.all(memberInGroup.inGroup.map(id => groupServices.isUserAdmin(groupId, id)));
        if (memberIsAdmin.every(isAdmin => !isAdmin)) {
            return res.status(400).json({ error: 'User/s is/are not admin(s)' });
        }
        // Get IDs of users who are admin
        const demotableMembers = memberInGroup.inGroup.filter((id, idx) => memberIsAdmin[idx]);
        console.log('Demotable Members:', demotableMembers);
        const result = await groupServices.demoteFromAdmin(groupId, demotableMembers);
        if (!result) {
            return res.status(404).json({ error: 'Group not found or user not an admin' });
        }
        res.status(200).json(result, { message: 'User(s) demoted from admin successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
        console.log(error);
    }
}

exports.leaveGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        if (!groupId) {
            return res.status(400).json({ error: 'Group ID is required' });
        }
        
        const userId = req.user.id;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        
        const result = await groupServices.leaveGroup(groupId, userId);
        if (!result) {
            return res.status(404).json({ error: 'Group not found or user not in group' });
        }
        
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
        console.log(error);
    }
}

exports.deleteGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        if (!groupId) {
            return res.status(400).json({ error: 'Group ID is required' });
        }
        const userId = req.user.id;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const adminCheck = await groupServices.isUserAdmin(groupId, userId);
        if (!adminCheck) {
            return res.status(403).json({ error: 'Only admins can delete members' });
        }
        await groupServices.deleteGroup(groupId);
        res.status(200).json({ message: 'Group deleted successfully'});
    } catch (error) {
        res.status(500).json({ error: error.message });
        console.log(error);
    }
}