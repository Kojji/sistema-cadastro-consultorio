'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
   await queryInterface.bulkInsert({
     tableName: 'Roles'
   }, [
    {
      title: 'Administrador',
      description: 'Escopo global sobre todo o sistema.',
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: 'Diretor',
      description: 'Escopo global sobre a escola.',
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: 'Redator',
      description: 'Consegue criar publicações para os Murais de Professor e Aluno.',
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: 'Professor',
      description: 'Administra as turmas, aplica trabalhos e atividades.',
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: 'Aluno',
      description: 'Consome o conteúdo criado por Redatores e Professores',
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
   ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete({
      tableName: 'Roles'
    }, null, {});
  }
};
