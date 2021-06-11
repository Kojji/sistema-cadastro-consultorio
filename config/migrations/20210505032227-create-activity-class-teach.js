'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const schemas = await queryInterface.showAllSchemas();

    for (const schema of schemas) {
      await queryInterface.createTable('Activity_Class_Teaches', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
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
        description: {
          type: Sequelize.TEXT
        },
        title: {
          allowNull: false,
          type: Sequelize.STRING
        },
        deadline: {
          type: Sequelize.DATE,
          allowNull: true
        },
        active: {
          allowNull: false,
          type: Sequelize.BOOLEAN,
          defaultValue: false
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
        tableName: 'Activity_Class_Teaches',
        schema
      });
    }
  }
};