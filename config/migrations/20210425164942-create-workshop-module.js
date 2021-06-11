'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Workshop_Modules', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      active: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      available_in: {
        type: Sequelize.INTEGER,
        allowNull: false,
        default: 0,
        defaultValue: 0
      },
      WorkshopId: {
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'Workshops'
          },
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Workshop_Modules');
  }
};