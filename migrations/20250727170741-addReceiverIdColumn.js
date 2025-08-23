'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('chats', 'receiverId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE' // Delete chat if the user is deleted
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('chats', 'receiverId');
  }
};
