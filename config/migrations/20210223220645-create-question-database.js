'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Question_Databases', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
        default: ''
      },
      description: {
        type: Sequelize.STRING,
        allowNull: false,
        default: ''
      },
      question: {
        type: Sequelize.TEXT,
        allowNull: false,
        default: ''
      },
      active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        default: false
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
        allowNull: true,
        default: null
      },
      GradeId: {
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'Grades'
          },
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        allowNull: true,
        default: null
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
        allowNull: true,
        default: null
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
    await queryInterface.dropTable('Question_Databases');
  }
};