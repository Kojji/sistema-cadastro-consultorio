'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const schemas = await queryInterface.showAllSchemas();

    for (const schema of schemas) {
      await queryInterface.createTable('Classroom_Feed_Inquiry_Answers', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        ClassroomFeedInquiryId: {
          type: Sequelize.INTEGER,
          references: {
            model: {
              tableName: 'Classroom_Feed_Inquiries',
              schema
            },
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
          allowNull: false
        },
        ClassroomFeedInquiryOptionId: {
          type: Sequelize.INTEGER,
          references: {
            model: {
              tableName: 'Classroom_Feed_Inquiry_Options',
              schema
            },
            key: 'id'
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
            key: 'id'
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
        tableName: 'Classroom_Feed_Inquiry_Answers',
        schema
      });
    }
  }
};