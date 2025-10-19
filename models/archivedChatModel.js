const sequelize = require('../util/db_connection');
const { DataTypes } = require('sequelize');


const ArchivedChatModel = sequelize.define('archivedchats', {
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
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    receiverId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    groupId: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
});

module.exports = ArchivedChatModel;