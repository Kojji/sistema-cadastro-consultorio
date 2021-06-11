'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const schemas = await queryInterface.showAllSchemas();

    for (const schema of schemas) {
      await queryInterface.createTable('Classrooms', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        active: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          default: true
        },
        description: {
          type: Sequelize.STRING,
          allowNull: false,
          default: ''
        },
        LevelId: {
          type: Sequelize.INTEGER,
          references: {
            model: {
              tableName: 'Levels'
            },
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
        },
        SubjectId: {
          type: Sequelize.INTEGER,
          references: {
            model: {
              tableName: 'Subjects'
            },
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
        },
        CourseId: {
          type: Sequelize.INTEGER,
          references: {
            model: {
              tableName: 'Courses'
            },
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
        },
        courseName: {
          type: Sequelize.STRING
        },
        ProfessorId: {
          type: Sequelize.INTEGER,
          references: {
            model: {
              tableName: 'Professors',
              schema
            },
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
        },
        class_code: {
          type: Sequelize.STRING,
          allowNull: false
        },
        path_url: {
          type: Sequelize.STRING,
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
      }, {
        schema
      });
    }
  },
  down: async (queryInterface, Sequelize) => {
    const schemas = await queryInterface.showAllSchemas();

    for (const schema of schemas) {
      await queryInterface.dropTable({
        tableName: 'Classrooms',
        schema
      });
    }
  }
};