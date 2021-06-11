'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert({
      tableName: 'Flags'
    }, 
    [
      {
        title: 'ENEM',
        fixed: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Professor',
        fixed: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Vamos Treinar',
        fixed: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete({
      tableName: 'Flags'
    }, null, {});
  }
};
