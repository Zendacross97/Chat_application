'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('chats', 'mediaUrl', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'message' // This will place the new column after the message column
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('chats', 'mediaUrl');
  }
};
