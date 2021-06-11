'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Feed_Area_Level_Course_Grade_Subjects', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      FeedId: {
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'Feeds'
          },
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        allowNull: false
      },
      SubjectId: {
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'Subjects'
          },
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        allowNull: true,
        default: null
      },
      LevelId: {
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'Levels'
          },
          key: 'id'
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
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        allowNull: true,
        default: null
      },
      AreaId: {
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'Areas'
          },
          key: 'id'
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
          key: 'id'
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
    await queryInterface.dropTable('Feed_Area_Level_Course_Grade_Subjects');
  }
};