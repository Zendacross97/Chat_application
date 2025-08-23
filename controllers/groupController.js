const groupServices = require('../services/groupServices');

exports.getAllGroups = async (req, res) => {
    try {
        const userId = req.user.id;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const groups = await groupServices.getAllGroups(userId);
        if (!groups || groups.length === 0) {
            return res.status(404).json({ error: 'You are not in any group' });
        }
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

exports.getGroupMembers = async (req, res) => {
    try {
        const { groupId } = req.params;
        if (!groupId) {
            return res.status(400).json({ error: 'Group ID is required' });
        }
        
        const userId = req.user.id;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        
        // Fetch group members
        const members = await groupServices.getGroupMembers(groupId);
        
        if (!members || members.length === 0) {
            return res.status(404).json({ error: 'No members found in this group' });
        }
        
        res.status(200).json(members);
    } catch (error) {
        res.status(500).json({ error: error.message });
        console.log(error);
    }
}

exports.getUnaddedUsers = async (req, res) => {
    try {
        const { groupId } = req.params;
        if (!groupId) {
            return res.status(400).json({ error: 'Group ID is required' });
        }
        
        const userId = req.user.id;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        
        // Fetch users who are not in the group
        const unaddedUsers = await groupServices.getUnaddedUsers(groupId, userId);
        
        if (!unaddedUsers || unaddedUsers.length === 0) {
            return res.status(404).json({ error: 'No unadded users found' });
        }
        
        res.status(200).json(unaddedUsers);
    } catch (error) {
        res.status(500).json({ error: error.message });
        console.log(error);
    }
}

exports.addUserToGroup = async (req, res) => {
    try {
        const { groupId, userId } = req.params;
        if (!groupId || !userId) {
            return res.status(400).json({ error: 'Group ID and User ID are required' });
        }
        
        const currentUserId = req.user.id;
        if (!currentUserId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        
        // Check if the group exists
        const user = await groupServices.addUserToGroup(groupId, userId);
        if (!user) {
            return res.status(404).json({ error: 'Group not found or user already in group' });
        }
        
        res.status(200).json(user);
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