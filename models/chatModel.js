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
        allowNull: false
    }
});

module.exports = ChatModel;