'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const schemas = await queryInterface.showAllSchemas();

    for (const schema of schemas) {
      await queryInterface.createTable('Classroom_Feeds', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        title: {
          type: Sequelize.STRING,
          allowNull: false
        },
        content_type: {
          type: Sequelize.STRING,
          allowNull: false
        },
        content: {
          type: Sequelize.TEXT,
          allowNull: false,
          default: ''
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
          allowNull: false
        },
        video_url: {
          type: Sequelize.STRING,
          allowNull: true,
          default: null
        },
        FileId: {
          type: Sequelize.INTEGER,
          references: {
            model: {
              tableName: 'Files'
            },
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
          allowNull: true,
          default: null
        },
        ClassroomId: {
          type: Sequelize.INTEGER,
          references: {
            model: {
              tableName: 'Classrooms',
              schema
            },
            key: 'id',
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
      }, { schema });
    }
  },
  down: async (queryInterface, Sequelize) => {
    const schemas = await queryInterface.showAllSchemas();

    for (const schema of schemas) {
      await queryInterface.dropTable({
        tableName: 'Classroom_Feeds',
        schema
      });
    }
  }
};