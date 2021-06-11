'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
   await queryInterface.bulkInsert({
     tableName: 'Areas'
   }, [
    {
      title: 'História',
      description: '',
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: 'Educação Física',
      description: '',
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: 'Pedagogia',
      description: '',
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: 'Matemática',
      description: '',
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: 'Letras',
      description: '',
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: 'Educação Especial',
      description: '',
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: 'Ciências Biológicas',
      description: '',
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: 'Filosofia',
      description: '',
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: 'Sociologia',
      description: '',
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: 'Geografia',
      description: '',
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: 'Artes Visuais',
      description: '',
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: 'Química',
      description: '',
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete({
      tableName: 'Areas'
    }, null, {});
  }
};
