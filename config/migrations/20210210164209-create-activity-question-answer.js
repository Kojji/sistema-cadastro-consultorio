'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const schemas = await queryInterface.showAllSchemas();

    for (const schema of schemas) {
      await queryInterface.createTable('Activity_Question_Answers', {
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
          allowNull: true,
          default: null
        },
        ActivityOptionId: {
          type: Sequelize.INTEGER,
          references: {
            model: {
              tableName: 'Activity_Options',
              schema
            },
            key: 'id',
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
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
          allowNull: false
        },
        answer: {
          type: Sequelize.TEXT,
          allowNull: true,
          default: null
        },
        revised: {
          type: Sequelize.INTEGER,
          allowNull: false,
          default: 0
        },
        correct: {
          type: Sequelize.BOOLEAN,
          allowNull: true,
          default: null
        },
        question_score: {
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
        tableName: 'Activity_Question_Answers',
        schema
      });
    }
  }
};