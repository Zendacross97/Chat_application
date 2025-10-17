const path = require('path');
const chatService = require('../services/chatServices');
const userServices = require('../services/userServices');
const groupServices = require('../services/groupServices');
const awsServices = require('../services/awsServices');

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
        const mediaFile = req.file;
        if (!type || (type !== 'group' && type !== 'user')) {
            return res.status(400).json({ error: 'Invalid chat type' });
        }
        const userId = req.user.id;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        if (type === 'group') {
            const isMember = await groupServices.isUserInGroup(id, userId);
            if (!isMember) {
                return res.status(403).json({ error: 'You are not a member of this group' });
            }
        }
        const user = await userServices.getNameOfUserById(userId);// name is inside an object
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const name = user.name;
        
        let mediaUrl = null;
        if (mediaFile) {
            // Upload to S3
            mediaUrl = await awsServices.uploadToS3(mediaFile.buffer, mediaFile.originalname);
        }
        if (!message && !mediaUrl) {
            return res.status(400).json({ error: 'There is nothing to send' });
        }
        // Save mediaUrl in your chatService.createChat (add a mediaUrl param)
        await chatService.createChat(name, message, mediaUrl, userId, id, type); // Pass mediaUrl to createChat

        res.status(201).json({ name, message, mediaUrl });
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