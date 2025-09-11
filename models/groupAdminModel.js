const {DataTypes} = require('sequelize');
const sequelize = require('../util/db_connection');

const groupAdmin = sequelize.define('groupAdmins', {
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

module.exports = groupAdmin;