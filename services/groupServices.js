const Group = require('../models/groupsModel');
const UserGroup = require('../models/userGroupsModel');
const User = require('../models/userModel');
const {Op} = require('sequelize');

exports.getAllGroups = async (userId) => {
    try {
        // Fetch all groups associated with the user, ordered by name alphabetically
        const groups = await Group.findAll({
            include: [{
                model: UserGroup,
                as: 'userGroups', // Specify the alias
                where: { userId: userId }
            }],
            order: [['name', 'ASC']]
        });
        return groups;
    } catch (error) {
        console.log(error);
        throw new Error('Error fetching groups:', error.message);
    }
}

exports.createGroup = async (name, userId) => {
    try {
        // Create the group
        const group = await Group.create({ name });
        
        // Associate the user with the group
        await UserGroup.create({ userId, groupId: group.id });
        
        return group;
    } catch (error) {
        console.log(error);
        throw new Error('Error creating group:', error.message);
    }
}

exports.getGroupMembers = async (groupId) => {
    try {
        // Fetch group members
        const group = await UserGroup.findAll({
            where: { groupId },
            include: [{
                model: User,
               attributes: ['id', 'name'] // Specify the attributes you want to retrieve
            }]
        });

        if (!group) {
            throw new Error('Group not found');
        }

        return group;
    } catch (error) {
        console.log(error);
        throw new Error('Error fetching group members:', error.message);
    }
}

exports.getUnaddedUsers = async (groupId, userId) => {
    try {
        // Fetch users who are not part of the group
        const unaddedUsers = await UserGroup.findAll({
            where: { groupId: groupId },
            attributes: ['userId']
        });

        const userIds = unaddedUsers.map(user => user.userId);
        
        // Fetch all users except those already in the group
        const users = await User.findAll({
            where: { id: { [Op.notIn]: userIds }}
        });
        
        return users;
    } catch (error) {
        console.log(error);
        throw new Error('Error fetching unadded users:', error.message);
    }
}

exports.addUserToGroup = async (groupId, userId) => {
    try {
        await UserGroup.create({ userId, groupId });
        
        return { message: 'User added to group successfully' };
    } catch (error) {
        console.log(error);
        throw new Error('Error adding user to group:', error.message);
    }
}

exports.leaveGroup = async (groupId, userId) => {
    try {
        // Check if the user is part of the group
        const userGroup = await UserGroup.findOne({ where: { groupId, userId } });
        
        if (!userGroup) {
            throw new Error('User not part of the group');
        }
        
        // Remove the user from the group
        await UserGroup.destroy({ where: { groupId, userId } });
        
        return { message: 'Left group successfully' };
    } catch (error) {
        console.log(error);
        throw new Error('Error leaving group:', error.message);
    }
}