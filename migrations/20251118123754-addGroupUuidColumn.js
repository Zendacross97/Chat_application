'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('groups', 'uuid', {
      type: Sequelize.STRING,
      allowNull: false,
      after: 'name' // This will place the new column after the name column
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('groups', 'uuid');
  }
};
