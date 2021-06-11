'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const schemas = await queryInterface.showAllSchemas();

    for (const schema of schemas) {
      await queryInterface.createTable('Activity_Results', {
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
            onDelete: 'SET NULL',
            allowNull: false
        },
        StudentId: {
          type: Sequelize.INTEGER,
          references: {
            model: {
              tableName: 'Students',
              schema
            },
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
          allowNull: false
        },
        revised: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          default: false
        },
        finalized: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          default: false
        },
        student_score: {
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
      }, { schema });
    }
  },
  down: async (queryInterface, Sequelize) => {
    const schemas = await queryInterface.showAllSchemas();

    for (const schema of schemas) {
      await queryInterface.dropTable({
        tableName: 'Activity_Results',
        schema
      });
    }
  }
};