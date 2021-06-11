'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('User_Areas', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      UserId: {
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'Users'
          },
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        allowNull: false
      },
      AreaId: {
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'Areas'
          },
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        allowNull: false
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

    await queryInterface.removeColumn(
      {
        tableName: 'Users',
      },
      'AreaId'
    )
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('User_Areas');

    await queryInterface.addColumn(
      {
        tableName: 'Users',
      },
      'AreaId',
      {
        type: Sequelize.INTEGER,
        default: null,
        defaultValue: null,
        allowNull: true
      }
    );
  }
};