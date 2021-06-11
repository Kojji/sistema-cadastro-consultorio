'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const schemas = await queryInterface.showAllSchemas();

    for (const schema of schemas) {
      await queryInterface.createTable('Classroom_Feed_Comments', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        ClassroomFeedId: {
          type: Sequelize.INTEGER,
          references: {
            model: {
              tableName: 'Classroom_Feeds',
              schema
            },
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
          allowNull: false
        },
        ProfessorId: {
          type: Sequelize.INTEGER,
          references: {
            model: {
              tableName: 'Professors',
              schema
            },
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
          allowNull: true,
          default: null
        },
        StudentId: {
          type: Sequelize.INTEGER,
          references: {
            model: {
              tableName: 'Students',
              schema
            },
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
          allowNull: true,
          default: null
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
        content: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        father: {
          type: Sequelize.INTEGER,
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
        tableName: 'Classroom_Feed_Comments',
        schema
      });
    }
  }
};