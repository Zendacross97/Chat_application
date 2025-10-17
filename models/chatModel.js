const sequelize = require('../util/db_connection');
const { DataTypes } = require('sequelize');


const ChatModel = sequelize.define('chats', {
    id:  { 
        type: DataTypes.INTEGER, 
        autoIncrement: true, 
        primaryKey: true 
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    message: {
        type: DataTypes.STRING,
        allowNull: true
    },
    mediaUrl: {
        type: DataTypes.STRING,
        allowNull: true
    }
});

module.exports = ChatModel;