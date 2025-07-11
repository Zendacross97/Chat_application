'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('chats', 'name', {
      type: Sequelize.STRING,
      allowNull: false,
      after: 'id' // This will place the new column after the id column
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('chats', 'name');
  }
};
