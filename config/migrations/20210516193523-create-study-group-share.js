'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Study_Group_Shares', {
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
      StudyGroupId: {
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'Study_Groups'
          },
          key: 'id'
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
      message: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: ''
      },
      video_url: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null
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
    await queryInterface.dropTable('Study_Group_Shares');
  }
};