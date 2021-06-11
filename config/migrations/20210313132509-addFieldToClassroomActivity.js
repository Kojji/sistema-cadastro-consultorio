'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const schemas = await queryInterface.showAllSchemas();

    for (const schema of schemas) {
      await queryInterface.addColumn(
        {
          tableName: 'Activities',
          schema
        },
        'ActivityDatabaseId',
        {
          type: Sequelize.INTEGER,
          default: null,
          defaultValue: null,
          allowNull: true
        }
      );
    }
  },

  down: async (queryInterface, Sequelize) => {
    const schemas = await queryInterface.showAllSchemas();

    for (const schema of schemas) {
      await queryInterface.removeColumn(
        {
          tableName: 'Activities',
          schema
        },
        'ActivityDatabaseId'
      )
    }
  }
};
