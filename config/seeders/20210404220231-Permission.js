'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert({
      tableName: 'Permissions'
    }, 
    [
      {
        alias: 'Banco de Questões',
        description: 'Possibilita a criação e gerenciamento do Banco de Questões.',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        alias: 'Feed',
        description: 'Possibilita realizar postagens nos Feed, sem precisar pedir por aprovação.',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete({
      tableName: 'Permissions'
    }, null, {});
  }
};
