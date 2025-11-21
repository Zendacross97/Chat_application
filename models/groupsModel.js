const { DataTypes } = require('sequelize');
const sequelize = require('../util/db_connection');

const Group = sequelize.define('groups', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    uuid: {
        type: DataTypes.STRING,
        allowNull: false
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'group' // Default type is 'group'
    }
}, {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
});

module.exports = Group;