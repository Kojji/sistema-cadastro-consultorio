'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
   await queryInterface.bulkInsert({
     tableName: 'Levels'
   }, [
     {
      title: 'Educação Infantil',
      description: '',
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Ensino Fundamental 1',
      description: '',
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Ensino Fundamental 2',
      description: '',
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Ensino Médio',
      description: '',
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Vestibulares/ENEM',
      description: '',
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Ensino Técnico',
      description: '',
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Ensino Superior',
      description: '',
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Pós-Graduação',
      description: '',
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Mestrado',
      description: '',
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Doutorado',
      description: '',
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
     }
   ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete({
      tableName: 'Levels'
    }, null, {});
  }
};
