'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const schemas = await queryInterface.showAllSchemas();

    for (const schema of schemas) {
      await queryInterface.addColumn(
        {
          tableName: 'Activity_Questions',
          schema
        },
        'timer',
        {
          type: Sequelize.STRING,
          allowNull: true,
          default: null
        }
      )
    }
  },

  down: async (queryInterface, Sequelize) => {
    const schemas = await queryInterface.showAllSchemas();

    for (const schema of schemas) {
      await queryInterface.removeColumn(
        {
          tableName: 'Activity_Questions',
          schema
        },
        'timer'
      )
    }
  }
};
