'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const schemas = await queryInterface.showAllSchemas();

    for (const schema of schemas) {
      await queryInterface.createTable('Activities', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        active: {
          type: Sequelize.BOOLEAN,
          allowNull: false
        },
        type: {
          type: Sequelize.STRING,
          allowNull: false
        },
        title: {
          type: Sequelize.STRING,
          allowNull: false,
          default: ''
        },
        deadline: {
          type: Sequelize.DATE,
          allowNull: false
        },
        timer: {
          type: Sequelize.STRING,
          allowNull: true,
          default: null
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: false,
          default: ''
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
        total_score: {
          type: Sequelize.FLOAT,
          allow_null: false,
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
        tableName: 'Activities',
        schema
      });
    }
  }
};