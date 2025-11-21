const Group = require('../models/groupsModel');
const User = require('../models/userModel');
const UserGroup = require('../models/userGroupsModel');
const GroupAdmin = require('../models/groupAdminModel');
const {Op} = require('sequelize');

exports.getAllGroups = async (userId) => {
    try {
        // Fetch all groups associated with the user, ordered by name alphabetically
        const groupLists = await Group.findAll({
            include: [{
                model: UserGroup,
                as: 'userGroups', // Specify the alias
                where: { userId: userId }
            }],
            order: [['name', 'ASC']]
        });

        const groups = await Promise.all(groupLists.map( async (group) => {

            // fetch group members except the current user
            const groupMembers = await UserGroup.findAll({
                where: { 
                    groupId: group.id,
                    userId: { [Op.ne]: userId } // Exclude the current user
                },
                attributes: ['userId'],
                include: [{
                    model: User,
                    attributes: ['id', 'name', 'number'] // Specify the attributes you want to retrieve
                }]
            });
            const users = groupMembers.map(g => g.user);
            const memberIds = users.map(user => user.id);

            // Check if current user is admin
            const isAdmin = await GroupAdmin.findOne({ where: { groupId: group.id, userId } });

            //Fetch admin members execept the current user
            const admins = await GroupAdmin.findAll({
                where: { 
                    groupId: group.id,
                    userId: { [Op.ne]: userId } // Exclude the current user
                },
                attributes: ['userId']
            });
            const adminIds = admins.map(admin => admin.userId);
            
            // get all group members with their admin status
            const allGroupMembers = users.map(user => ({
                id: user.id,
                name: user.name,
                number: user.number,
                isAdmin: adminIds.includes(user.id)
            }));

            // Fetch all users except those already in the group
            const nonGroupMembers = await User.findAll({
                where: { 
                    [Op.and]: [
                        { id: { [Op.notIn]: memberIds } },
                        { id: { [Op.ne]: userId } }
                    ]
                },
                attributes: ['id', 'name', 'number'] // Specify the attributes you want to retrieve
            });

            // Filter out admins from group members to get promotable members
            const promotableMembers = users.filter(user => !adminIds.includes(user.id));

            // Filter out non-admins from group members to get demotable members
            const demotableMembers = users.filter(user => adminIds.includes(user.id));

            if (!!isAdmin) {
                return { id: group.id, name: group.name, uuid: group.uuid, type: group.type , isAdmin: !!isAdmin, members: allGroupMembers, admins: demotableMembers, non_admins: promotableMembers, non_members: nonGroupMembers };
            }
            else {
                return { id: group.id, name: group.name, uuid: group.uuid, type: group.type , isAdmin: !!isAdmin, members: allGroupMembers };
            }
        }));

        return groups;
    } catch (error) {
        console.log(error);
        throw new Error('Error fetching groups:', error.message);
    }
}

exports.createGroup = async (name, uuid, userId) => {
    try {
        // Create the group
        const group = await Group.create({ name, uuid });
        
        // Associate the user with the group
        await UserGroup.create({ userId, groupId: group.id });

        // Make the user an admin of the group
        await GroupAdmin.create({ userId, groupId: group.id });
        
        return group;
    } catch (error) {
        console.log(error);
        throw new Error('Error creating group:', error.message);
    }
}

exports.isUserAdmin = async (groupId, userId) => {
    try {
        const admin = await GroupAdmin.findOne({ where: { groupId, userId } });
        return !!admin; // Return true if admin exists, false otherwise
    } catch (error) {
        console.log(error);
        throw new Error('Error checking admin status:', error.message);
    }
}

exports.isUserInGroup = async (groupId, userId) => {
    try {
        const userGroup = await UserGroup.findOne({ where: { groupId, userId } });
        return !!userGroup; // Return true if user is in group, false otherwise
    } catch (error) {
        console.log(error);
        throw new Error('Error checking group membership:', error.message);
    }
}

exports.isMemberInGroup = async (groupId, memberIds) => {
    try {
        // Find all UserGroup entries for the given groupId and memberIds
        const userGroups = await UserGroup.findAll({
            where: {
                groupId,
                userId: { [Op.in]: memberIds }
            }
        });
        // Extract userIds that are in the group
        const inGroup = userGroups.map(ug => ug.userId);
        // Find userIds that are not in the group
        const notInGroup = memberIds.filter(id => !inGroup.includes(id));
        console.log(inGroup, notInGroup);
        return { inGroup:inGroup, notInGroup:notInGroup };
    } catch (error) {
        console.log(error);
        throw new Error('Error checking group membership:', error.message);
    }
}

exports.addUserToGroup = async (groupId, memberIds) => {
    try {
        // create entries in UserGroup for each userId
        await Promise.all(memberIds.map(id => UserGroup.create({ userId: id, groupId })));
        return { message: 'User added to group successfully' };
    } catch (error) {
        console.log(error);
        throw new Error('Error adding user to group:', error.message);
    }
}

exports.removeUserFromGroup = async (groupId, memberIds) => {
    try {
        // Remove entries in UserGroup for each userId
        await Promise.all(memberIds.map(id => {
            UserGroup.destroy({ where: { userId: id, groupId } })
            GroupAdmin.destroy({ where: { userId: id, groupId } })
        }));
        return { message: 'User(s) removed from group successfully' };
    } catch (error) {
        console.log(error);
        throw new Error('Error removing user from group:', error.message);
    }
}

exports.promoteToAdmin = async (groupId, memberIds) => {
    try {
        // create entries in GroupAdmin for each userId
        await Promise.all(memberIds.map(id => GroupAdmin.create({ userId: id, groupId })));
        return { message: 'User(s) promoted to admin successfully' };
    } catch (error) {
        console.log(error);
        throw new Error('Error promoting user to admin:', error.message);
    }
}

exports.demoteFromAdmin = async (groupId, memberIds) => {
    try {
        // Remove entries in GroupAdmin for each userId
        await Promise.all(memberIds.map(id => GroupAdmin.destroy({ where: { userId: id, groupId } })));
        return { message: 'User(s) demoted from admin successfully' };
    } catch (error) {
        console.log(error);
        throw new Error('Error demoting user from admin:', error.message);
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
        const affectedRowsUserGroup = await UserGroup.destroy({ where: { groupId, userId } });
        if (affectedRowsUserGroup === 0) {
            throw new Error (`UserGroup with ID ${groupId} not found or no changes were made.`);
        }

        // Also remove from GroupAdmin if the user is an admin
        await GroupAdmin.destroy({ where: { groupId, userId } });

        //Check if any member is in that group
        const remainingMembers = await UserGroup.findAll({where: { groupId }});
        if (remainingMembers.length === 0) {
            const affectedRowsGroup = await Group.destroy({where: { id: groupId }});
            if (affectedRowsGroup === 0) {
                throw new Error (`Group with ID ${groupId} not found or no changes were made.`);
            }
        }
        
        return { message: 'Left group successfully' };
    } catch (error) {
        console.log(error);
        throw new Error('Error leaving group:', error.message);
    }
}

exports.deleteGroup = async (groupId) => {
    try {
        const affectedRowsUserGroup = await UserGroup.destroy({ where: { groupId } });
        if (affectedRowsUserGroup === 0) {
            throw new Error (`UserGroup with ID ${groupId} not found or no changes were made.`);
        }
        await GroupAdmin.destroy({ where: { groupId } });
        const affectedRowsGroup = await Group.destroy({where: { id: groupId }});
        if (affectedRowsGroup === 0) {
            throw new Error (`Group with ID ${groupId} not found or no changes were made.`);
        }
    } catch (error) {
        console.log(error);
        throw new Error('Error deleting group:', error.message);
    }   
}