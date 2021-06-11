'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const schemas = await queryInterface.showAllSchemas();

    for (const schema of schemas) {
      await queryInterface.createTable('Activity_Questions', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        ActivityId: {
          type: Sequelize.INTEGER,
          references: {
            model: {
              tableName: 'Activities',
              schema
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
        FileId: {
          type: Sequelize.INTEGER,
          references: {
            model: {
              tableName: 'Files'
            },
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
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
      }, { schema });
    }
  },
  down: async (queryInterface, Sequelize) => {
    const schemas = await queryInterface.showAllSchemas();

    for (const schema of schemas) {
      await queryInterface.dropTable({
        tableName: 'Activity_Questions',
        schema
      });
    }
  }
};