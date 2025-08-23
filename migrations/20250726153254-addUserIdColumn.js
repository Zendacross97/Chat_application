'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('usergroups', 'userId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
    await queryInterface.addColumn('usergroups', 'groupId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'groups',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('usergroups', 'userId');
    await queryInterface.removeColumn('usergroups', 'groupId');
  }
    
};
