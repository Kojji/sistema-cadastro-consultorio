'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Files', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      folder: {
        type: Sequelize.STRING,
        allowNull: false
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false
      },
      path_storage: {
        type: Sequelize.STRING,
        allowNull: false
      },
      url_storage: {
        type: Sequelize.STRING,
        allowNull: false
      },
      InstitutionId: {
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'Institutions'
          },
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        allowNull: true
      },
      schemaname: {
        type: Sequelize.STRING,
        allowNull: true,
        default: ''
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
        onDelete: 'SET NULL',
        allowNull: false
      },
      areas: {
        type: Sequelize.STRING,
        allowNull: true,
        default: null
      },
      subjects: {
        type: Sequelize.STRING,
        allowNull: true,
        default: null
      },
      levels: {
        type: Sequelize.STRING,
        allowNull: true,
        default: null
      },
      grades: {
        type: Sequelize.STRING,
        allowNull: true,
        default: null
      },
      courses: {
        type: Sequelize.STRING,
        allowNull: true,
        default: null
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
    await queryInterface.dropTable('Files');
  }
};