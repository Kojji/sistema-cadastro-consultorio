'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Question_Database_Flags', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
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
      FlagId: {
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'Flags'
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

    await queryInterface.addColumn(
      {
        tableName: 'Question_Databases',
      },
      'justification',
      {
        type: Sequelize.TEXT,
        default: '',
        defaultValue: '',
        allowNull: true
      }
    );
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Question_Database_Flags');

    await queryInterface.removeColumn(
      {
        tableName: 'Flags',
      },
      'justification'
    )
  }
};