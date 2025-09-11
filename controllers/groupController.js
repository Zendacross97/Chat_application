const groupServices = require('../services/groupServices');

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
        
        const group = await groupServices.createGroup(name, userId);
        
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
        
        // Check if the group exists
        const user = await groupServices.addUserToGroup(groupId, userIds);
        if (!user) {
            return res.status(404).json({ error: 'Group not found or user already in group' });
        }
        
        res.status(200).json(user);
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
        const result = await groupServices.removeUserFromGroup(groupId, userIds);
        if (!result) {
            return res.status(404).json({ error: 'Group not found or user not in group' });
        }
        res.status(200).json(result);
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
        const result = await groupServices.promoteToAdmin(groupId, userIds);
        if (!result) {
            return res.status(404).json({ error: 'Group not found or user not in group' });
        }
        res.status(200).json(result);
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
        const result = await groupServices.demoteFromAdmin(groupId, userIds);
        if (!result) {
            return res.status(404).json({ error: 'Group not found or user not an admin' });
        }
        res.status(200).json(result);
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