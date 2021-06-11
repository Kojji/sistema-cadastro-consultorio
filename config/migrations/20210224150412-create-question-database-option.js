'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Question_Database_Options', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      option: {
        type: Sequelize.STRING,
        allowNull: false,
        default: ''
      },
      description: {
        type: Sequelize.STRING,
        allowNull: false,
        default: ''
      },
      correct: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        default: false
      },
      QuestionDatabaseId: {
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'Question_Databases'
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
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Question_Database_Options');
  }
};