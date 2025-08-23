'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('groups', 'type', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'group', // Default type is 'group'
      position: 'after name' // Ensures 'type' comes after 'name'
    });
    await queryInterface.addColumn('users', 'type', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'user' // Default type is 'user'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('groups', 'type');
    await queryInterface.removeColumn('users', 'type');
  }
};
