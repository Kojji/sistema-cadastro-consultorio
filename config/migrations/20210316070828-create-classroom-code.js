'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const schemas = await queryInterface.showAllSchemas();

    for (const schema of schemas) {

      await queryInterface.removeColumn(
        {
          tableName: 'Classrooms',
          schema
        },
        'class_code'
      )

      await queryInterface.removeColumn(
        {
          tableName: 'Classrooms',
          schema
        },
        'path_url'
      )

      await queryInterface.createTable('Classroom_Codes', {
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
      }, {schema});
    }
  },
  down: async (queryInterface, Sequelize) => {
    const schemas = await queryInterface.showAllSchemas();

    for (const schema of schemas) {

      await queryInterface.addColumn(
        {
          tableName: 'Classrooms',
          schema
        },
        'path_url',
        {
          type: Sequelize.STRING,
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
          default: '',
          allowNull: false
        }
      );

      await queryInterface.addColumn(
        {
          tableName: 'Classrooms',
          schema
        },
        'class_code',
        {
          type: Sequelize.STRING,
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
          default: '',
          allowNull: false
        }
      );

      await queryInterface.dropTable({
        tableName: 'Classroom_Codes',
        schema
      });
    }
  }
};