const User = require('../models/userModel');
const Chat = require('../models/chatModel');

//User and Chat models are associated such that a User can have many Chats, and each Chat belongs to a User.
User.hasMany(Chat);
Chat.belongsTo(User);

module.exports = {
    User,
    Chat
};