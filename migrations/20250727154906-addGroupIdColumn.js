'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('chats', 'groupId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'groups',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL' // Set to NULL if the group is deleted
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('chats', 'groupId');
  }
};
