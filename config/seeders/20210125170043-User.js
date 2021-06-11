'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
   await queryInterface.bulkInsert({
     tableName: 'Users'
   }, [
    {
      name: 'Administrador Geral',
      username: 'admin_general',
      email: 'admin@teachlearn.com.br',
      password: '$2a$04$MTxUHxERlZXJRG.RxdvH6uWT.T5N31q2lDGFrQcYrrvel2d54RblO',
      phone: '(67) 99999-9999',
      key: null,
      confirmed: true,
      active: true,
      photo: null,
      tour: false,
      InstitutionId: null,
      connected: false,
      ip_connected: '',
      dtbirth: '',
      cpf: '000.000.000-01',
      rg: '000.000.001',
      profession: null,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Redator Global',
      username: 'redator_global',
      email: 'redator@global.com.br',
      password: '$2a$04$MTxUHxERlZXJRG.RxdvH6uWT.T5N31q2lDGFrQcYrrvel2d54RblO',
      phone: '(67) 99999-9999',
      key: null,
      confirmed: true,
      active: true,
      photo: null,
      tour: false,
      InstitutionId: null,
      connected: false,
      ip_connected: '',
      dtbirth: '',
      cpf: '000.000.000-03',
      rg: '000.000.003',
      profession: 'Instrutor de Ciências Exatas e da Terra',
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
