'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const schemas = await queryInterface.showAllSchemas();

    for (const schema of schemas) {
      await queryInterface.createTable('Activity_Class_Teach_Students', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        ActivityClassTeachId: {
          type: Sequelize.INTEGER,
          references: {
            model: {
              tableName: 'Activity_Class_Teaches',
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
        sent: {
          allowNull: false,
          type: Sequelize.BOOLEAN,
          defaultValue: false
        },
        status: {
          allowNull: false,
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        type: {
          allowNull: true,
          type: Sequelize.STRING
        },
        video_url: {
          allowNull: true,
          type: Sequelize.STRING
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
        tableName: 'Activity_Class_Teach_Students',
        schema
      });
    }
  }
};