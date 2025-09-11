const { Op } = require('sequelize');
const Chat = require('../models/chatModel');

exports.createChat = async (name, message, userId, id, type) => {
    try {
        // Create a chat entry based on the type (group or user)
        if (type === 'group') {
            return await Chat.create({ 
                name: name,
                message: message, 
                userId: userId, 
                groupId: id 
            });
        }
        if (type === 'user') {
            return await Chat.create({ 
                name: name,
                message: message, 
                userId: userId, 
                receiverId: id 
            });
        }
    } catch (error) {
        console.log(error);
        throw new Error('Error creating chat:', error.message);
    }
}

exports.getLastTenChats = async (id, userId, chatType) => {
    try {
        let whereClause = {};
        if (chatType === 'group') {
            whereClause = { groupId: id };
        } else if (chatType === 'user') {
            whereClause = {
                [Op.or]: [
                    { receiverId: userId, userId: id },
                    { userId: userId, receiverId: id }
                ]
            };
        }

        return await Chat.findAll({
            where: whereClause,
            order: [['createdAt', 'DESC']],
            limit: 10
        });
    } catch (error) {
        throw new Error('Error fetching chat history:', error.message);
    }
}

exports.getLastRemainingChats = async (lastMessageId, id, userId, chatType) => {
    try {
        let whereClause = {};
        if (chatType === 'group') {
            whereClause = { groupId: id };
        } else if (chatType === 'user') {
            whereClause = {
                [Op.or]: [
                    { receiverId: userId, userId: id },
                    { userId: userId, receiverId: id }
                ]
            };
        }
        return await Chat.findAll({
            where: {
                ...whereClause,
                id: {
                    [Op.gt]: lastMessageId // Fetch chats with ID greater than lastMessageId
                }
            },
        });
    } catch (error) {
        throw new Error('Error fetching remaining chat history:', error.message);
    }
}