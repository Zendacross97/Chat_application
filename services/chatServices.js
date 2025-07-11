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

exports.getAllChat = async () => {
    try {
        return await Chat.findAll();
    } catch (error) {
        throw new Error('Error fetching chat history:', error.message);
    }
}