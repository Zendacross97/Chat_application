const {DataTypes} = require('sequelize');
const sequelize = require('../util/db_connection');

const UserGroup = sequelize.define('userGroups', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    }
}, {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
});

module.exports = UserGroup;