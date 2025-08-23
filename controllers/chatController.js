const path = require('path');
const chatService = require('../services/chatServices');
const userServices = require('../services/userServices');
const groupServices = require('../services/groupServices');

exports.getChatPage = (req, res) => {
    res.sendFile(path.join(__dirname, '../views', 'chat.html'));
}

exports.sendChat = async (req, res) => {
    try {
        const id = req.params.id; // This can be groupId or receiverId
        if (!id) {
            return res.status(400).json({ error: 'Chat ID is required' });
        }
        const { message, type } = req.body;
        if (!message) {
            return res.status(400).json({ error: 'Chat credentials are incomplete' });
        }
        const userId = req.user.id;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const user = await userServices.getNameOfUserById(userId);// name is inside an object
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const name = user.name;
        
        await chatService.createChat(name, message, userId, id, type);
        res.status(201).json({ name: name, message: message });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

exports.getChat = async (req, res) => {
    try {
        const lastMessageId = +(req.query.lastMessageId);
        if (!lastMessageId) {
            return res.status(400).json({ error: 'Invalid last message ID' });
        }
        const chatType = req.query.type;
        if (!chatType || (chatType !== 'group' && chatType !== 'user')) {
            return res.status(400).json({ error: 'Invalid chat type' });
        }
        const userId = req.user.id;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const id = req.params.id; // This can be groupId or receiverId
        if (!id) {
            return res.status(400).json({ error: 'Chat ID is required' });
        }
        if (lastMessageId === -1) {
            const chats = await chatService.getLastTenChats(id, userId, chatType);
            if (!chats || chats.length === 0) {
                return res.status(404).json({ error: 'No chat history found' });
            }
            res.status(200).json(chats);
        }
        else {
            const chats = await chatService.getLastRemainingChats(lastMessageId, id, userId, chatType);
            res.status(200).json(chats);
        }
    } catch (error) {
        res.status(500).json({ error});
        console.log(error);
    }
};