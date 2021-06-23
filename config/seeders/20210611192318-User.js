'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert({
      tableName: 'Users'
    }, [
      {
        name: 'Administrador Geral',
        username: 'admin',
        email: 'admin@admin.com',
        password: '$2a$04$kf136laQMVcu3H39CjzVK.6FqhiIPOrOq4bGgEULeDJUSbNsGUp2G',
        confirmed: true,
        active: true,
        photo: null,
        birthday: '',
        cpf: '000.000.000-01',
        role: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },
  
  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete({
      tableName: 'Users'
    }, null, {});
  }
};
