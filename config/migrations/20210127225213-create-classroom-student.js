'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const schemas = await queryInterface.showAllSchemas();

    for (const schema of schemas) {
      await queryInterface.createTable('Classroom_Students', {
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
          onDelete: 'SET NULL',
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
        },
        absences: {
          type: Sequelize.INTEGER,
          allowNull: false,
          default: 0
        },
        attendance: {
          type: Sequelize.INTEGER,
          allowNull: false,
          default: 0
        },
        status: {
          type: Sequelize.STRING,
          allowNull: false,
          default: '0'
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
        tableName: 'Classroom_Students',
        schema
      });
    }
  }
};