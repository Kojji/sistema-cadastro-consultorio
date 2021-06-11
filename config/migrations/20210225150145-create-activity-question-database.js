'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Activity_Question_Databases', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      ActivityDatabaseId: {
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'Activity_Databases'
          },
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        allowNull: false
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false
      },
      FileId: {
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'Files'
          },
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        allowNull: true,
        default: null
      },
      question: {
        type: Sequelize.TEXT,
        allowNull: false,
        default: ''
      },
      score: {
        type: Sequelize.FLOAT,
        allowNull: false,
        default: 0
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
    await queryInterface.dropTable('Activity_Question_Databases');
  }
};