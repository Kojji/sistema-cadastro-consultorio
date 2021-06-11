'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const schemas = await queryInterface.showAllSchemas();

    for (const schema of schemas) {
      await queryInterface.createTable('Activity_Question_Student_Files', {
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
        ActivityQuestionId: {
          type: Sequelize.INTEGER,
          references: {
            model: {
              tableName: 'Activity_Questions',
              schema
            },
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
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
          onDelete: 'CASCADE',
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
          onDelete: 'SET NULL',
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
      }, { schema });
    }
  },
  down: async (queryInterface, Sequelize) => {
    const schemas = await queryInterface.showAllSchemas();

    for (const schema of schemas) {
      await queryInterface.dropTable({
        tableName: 'Activity_Question_Student_Files',
        schema
      });
    }
  }
};