'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const schemas = await queryInterface.showAllSchemas();

    for (const schema of schemas) {
      await queryInterface.addColumn(
        {
          tableName: 'Classroom_Students',
          schema
        },
        'points',
        {
          type: Sequelize.FLOAT,
          default: 0.0,
          defaultValue: 0.0,
          allowNull: false
        }
      ).then(async () => await queryInterface.addColumn(
        {
          tableName: 'Classroom_Students',
          schema
        },
        'performance',
        {
          type: Sequelize.INTEGER,
          default: 0,
          defaultValue: 0,
          allowNull: false
        }
      )).then(async () => await queryInterface.addColumn(
        {
          tableName: 'Classroom_Students',
          schema
        },
        'performance_negative',
        {
          type: Sequelize.INTEGER,
          default: 0,
          defaultValue: 0,
          allowNull: false
        }
      ))
    }
  },

  down: async (queryInterface, Sequelize) => {
    const schemas = await queryInterface.showAllSchemas();

    for (const schema of schemas) {
      await queryInterface.removeColumn(
        {
          tableName: 'Classroom_Students',
          schema
        },
        'points'
        )
          .then(() => queryInterface.removeColumn(
            {
              tableName: 'Classroom_Students',
              schema
            },
            'performance'
          ))
          .then(() => queryInterface.removeColumn(
            {
              tableName: 'Classroom_Students',
              schema
            },
            'performance_negative'
          ))
    }
  }
};
