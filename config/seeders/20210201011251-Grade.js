'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
   await queryInterface.bulkInsert({
     tableName: 'Grades'
   }, [
     {
      title: 'Infantil - Berçário - (0 a 1 ano)',
      description: '',
      active: true,
      LevelId: 1,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Infantil - G1 - (1 a 2 anos)',
      description: '',
      active: true,
      LevelId: 1,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Infantil - G2 - (2 anos)',
      description: '',
      active: true,
      LevelId: 1,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Infantil - G3 - (3 anos)',
      description: '',
      active: true,
      LevelId: 1,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Infantil - G4 - (4 anos)',
      description: '',
      active: true,
      LevelId: 1,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Infantil - G5 - (5 anos)',
      description: '',
      active: true,
      LevelId: 1,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: '1º Ano',
      description: '',
      active: true,
      LevelId: 2,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: '2º Ano',
      description: '',
      active: true,
      LevelId: 2,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: '3º Ano',
      description: '',
      active: true,
      LevelId: 2,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: '4º Ano',
      description: '',
      active: true,
      LevelId: 2,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: '5º Ano',
      description: '',
      active: true,
      LevelId: 2,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: '6º Ano',
      description: '',
      active: true,
      LevelId: 3,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: '7º Ano',
      description: '',
      active: true,
      LevelId: 3,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: '8º Ano',
      description: '',
      active: true,
      LevelId: 3,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: '9º Ano',
      description: '',
      active: true,
      LevelId: 3,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: '1º Ano',
      description: '',
      active: true,
      LevelId: 4,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: '2º Ano',
      description: '',
      active: true,
      LevelId: 4,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: '3º Ano',
      description: '',
      active: true,
      LevelId: 4,
      createdAt: new Date(),
      updatedAt: new Date()
     }
   ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete({
      tableName: 'Grades'
    }, null, {});
  }
};
