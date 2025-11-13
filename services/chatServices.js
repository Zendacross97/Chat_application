const { Op } = require('sequelize');
const sequelize  = require('../util/db_connection');
const Chat = require('../models/chatModel');
const ArchivedChat = require('../models/archivedChatModel');

exports.createChat = async (name, message, mediaUrl, userId, id, type) => {
    try {
        // Create a chat entry based on the type (group or user)
        if (type === 'group') {
            return await Chat.create({ 
                name: name,
                message: message,
                mediaUrl: mediaUrl, 
                userId: userId, 
                groupId: id 
            });
        }
        if (type === 'user') {
            return await Chat.create({ 
                name: name,
                message: message, 
                mediaUrl: mediaUrl,
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
            // order: [['createdAt', 'DESC']],
            order: [['createdAt', 'ASC']],
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

exports.archiveAndDeleteOldChats = async (cutoffDate) => {
    const transaction = await sequelize.transaction();
    try {
        const oldChats = await Chat.findAll({
            where: {
                createdAt: {
                    [Op.lt]: cutoffDate
                }
            },
            transaction
        });

        await ArchivedChat.bulkCreate(
            oldChats.map(chat => ({
                name: chat.name,
                message: chat.message,
                mediaUrl: chat.mediaUrl,
                userId: chat.userId,
                receiverId: chat.receiverId,
                groupId: chat.groupId
            })),
            { transaction }
        );

        await Chat.destroy({
            where: {
                createdAt: {
                    [Op.lt]: cutoffDate
                }
            },
            transaction
        });

        await transaction.commit();
        console.log('Old chats archived and deleted successfully.');
    } catch (error) {
        await transaction.rollback();
        console.error('Transaction failed:', error.message);
    }
};