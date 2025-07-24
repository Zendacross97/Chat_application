const { Op } = require('sequelize');
const Chat = require('../models/chatModel');

exports.createChat = async (name, message, userId) => {
    try {
        return await Chat.create({ 
            name: name,
            message: message, 
            userId: userId 
        });
    } catch (error) {
        console.log(error);
        throw new Error('Error creating chat:', error.message);
    }
}

exports.getLastTenChats = async () => {
    try {
        return await Chat.findAll({
            order: [['createdAt', 'DESC']],
            limit: 10
        });
    } catch (error) {
        throw new Error('Error fetching chat history:', error.message);
    }
}

exports.getLastRemainingChats = async (lastMessageId) => {
    try {
        return await Chat.findAll({
            where: {
                id: {
                    [Op.gt]: lastMessageId // Fetch chats with ID greater than lastMessageId
                }
            },
            // order: [['createdAt', 'DESC']]
        });
    } catch (error) {
        throw new Error('Error fetching remaining chat history:', error.message);
    }
}