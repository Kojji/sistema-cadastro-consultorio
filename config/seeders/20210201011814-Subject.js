'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
   await queryInterface.bulkInsert({
     tableName: 'Subjects'
   }, [
     {
      title: 'Língua Portuguesa',
      description: '',
      active: true,
      GradeId: 7,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Matemática',
      description: '',
      active: true,
      GradeId: 7,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Ciências Naturais',
      description: '',
      active: true,
      GradeId: 7,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'História',
      description: '',
      active: true,
      GradeId: 7,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Geografia',
      description: '',
      active: true,
      GradeId: 7,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Artes',
      description: '',
      active: true,
      GradeId: 7,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Educação Física',
      description: '',
      active: true,
      GradeId: 7,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Temas Transversais',
      description: 'Ética, Meio Ambiente, Saúde, Pluradidade Cultural e Orientação Sexual',
      active: true,
      GradeId: 7,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Língua Portuguesa',
      description: '',
      active: true,
      GradeId: 8,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Matemática',
      description: '',
      active: true,
      GradeId: 8,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Ciências Naturais',
      description: '',
      active: true,
      GradeId: 8,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'História',
      description: '',
      active: true,
      GradeId: 8,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Geografia',
      description: '',
      active: true,
      GradeId: 8,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Artes',
      description: '',
      active: true,
      GradeId: 8,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Educação Física',
      description: '',
      active: true,
      GradeId: 8,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Temas Transversais',
      description: 'Ética, Meio Ambiente, Saúde, Pluradidade Cultural e Orientação Sexual',
      active: true,
      GradeId: 8,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Língua Portuguesa',
      description: '',
      active: true,
      GradeId: 9,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Matemática',
      description: '',
      active: true,
      GradeId: 9,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Ciências Naturais',
      description: '',
      active: true,
      GradeId: 9,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'História',
      description: '',
      active: true,
      GradeId: 9,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Geografia',
      description: '',
      active: true,
      GradeId: 9,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Artes',
      description: '',
      active: true,
      GradeId: 9,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Educação Física',
      description: '',
      active: true,
      GradeId: 9,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Temas Transversais',
      description: 'Ética, Meio Ambiente, Saúde, Pluradidade Cultural e Orientação Sexual',
      active: true,
      GradeId: 9,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Língua Portuguesa',
      description: '',
      active: true,
      GradeId: 10,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Matemática',
      description: '',
      active: true,
      GradeId: 10,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Ciências Naturais',
      description: '',
      active: true,
      GradeId: 10,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'História',
      description: '',
      active: true,
      GradeId: 10,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Geografia',
      description: '',
      active: true,
      GradeId: 10,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Artes',
      description: '',
      active: true,
      GradeId: 10,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Educação Física',
      description: '',
      active: true,
      GradeId: 10,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Temas Transversais',
      description: 'Ética, Meio Ambiente, Saúde, Pluradidade Cultural e Orientação Sexual',
      active: true,
      GradeId: 10,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Língua Portuguesa',
      description: '',
      active: true,
      GradeId: 11,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Matemática',
      description: '',
      active: true,
      GradeId: 11,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Ciências Naturais',
      description: '',
      active: true,
      GradeId: 11,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'História',
      description: '',
      active: true,
      GradeId: 11,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Geografia',
      description: '',
      active: true,
      GradeId: 11,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Artes',
      description: '',
      active: true,
      GradeId: 11,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Educação Física',
      description: '',
      active: true,
      GradeId: 11,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Temas Transversais',
      description: 'Ética, Meio Ambiente, Saúde, Pluradidade Cultural e Orientação Sexual',
      active: true,
      GradeId: 11,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Língua Portuguesa',
      description: '',
      active: true,
      GradeId: 12,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Técnicas de Redação',
      description: '',
      active: true,
      GradeId: 12,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Matemática',
      description: '',
      active: true,
      GradeId: 12,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'História',
      description: '',
      active: true,
      GradeId: 12,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Geografia',
      description: '',
      active: true,
      GradeId: 12,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Ciências',
      description: 'Química e Física',
      active: true,
      GradeId: 12,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Artes',
      description: '',
      active: true,
      GradeId: 12,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Inglês',
      description: '',
      active: true,
      GradeId: 12,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Espanhol',
      description: '',
      active: true,
      GradeId: 12,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Teatro',
      description: '',
      active: true,
      GradeId: 12,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Empreendedorismo',
      description: '',
      active: true,
      GradeId: 12,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Educação Física',
      description: '',
      active: true,
      GradeId: 12,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Língua Portuguesa',
      description: '',
      active: true,
      GradeId: 13,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Técnicas de Redação',
      description: '',
      active: true,
      GradeId: 13,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Matemática',
      description: '',
      active: true,
      GradeId: 13,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'História',
      description: '',
      active: true,
      GradeId: 13,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Geografia',
      description: '',
      active: true,
      GradeId: 13,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Ciências',
      description: 'Química e Física',
      active: true,
      GradeId: 13,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Artes',
      description: '',
      active: true,
      GradeId: 13,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Inglês',
      description: '',
      active: true,
      GradeId: 13,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Espanhol',
      description: '',
      active: true,
      GradeId: 13,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Teatro',
      description: '',
      active: true,
      GradeId: 13,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Empreendedorismo',
      description: '',
      active: true,
      GradeId: 13,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Educação Física',
      description: '',
      active: true,
      GradeId: 13,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Língua Portuguesa',
      description: '',
      active: true,
      GradeId: 14,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Técnicas de Redação',
      description: '',
      active: true,
      GradeId: 14,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Matemática',
      description: '',
      active: true,
      GradeId: 14,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'História',
      description: '',
      active: true,
      GradeId: 14,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Geografia',
      description: '',
      active: true,
      GradeId: 14,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Ciências',
      description: 'Química e Física',
      active: true,
      GradeId: 14,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Artes',
      description: '',
      active: true,
      GradeId: 14,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Inglês',
      description: '',
      active: true,
      GradeId: 14,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Espanhol',
      description: '',
      active: true,
      GradeId: 14,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Teatro',
      description: '',
      active: true,
      GradeId: 14,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Empreendedorismo',
      description: '',
      active: true,
      GradeId: 14,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Educação Física',
      description: '',
      active: true,
      GradeId: 14,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Língua Portuguesa',
      description: '',
      active: true,
      GradeId: 15,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Técnicas de Redação',
      description: '',
      active: true,
      GradeId: 15,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Matemática',
      description: '',
      active: true,
      GradeId: 15,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'História',
      description: '',
      active: true,
      GradeId: 15,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Geografia',
      description: '',
      active: true,
      GradeId: 15,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Ciências',
      description: 'Química e Física',
      active: true,
      GradeId: 15,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Artes',
      description: '',
      active: true,
      GradeId: 15,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Inglês',
      description: '',
      active: true,
      GradeId: 15,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Espanhol',
      description: '',
      active: true,
      GradeId: 15,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Teatro',
      description: '',
      active: true,
      GradeId: 15,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Empreendedorismo',
      description: '',
      active: true,
      GradeId: 15,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Educação Física',
      description: '',
      active: true,
      GradeId: 15,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Artes',
      description: '',
      active: true,
      GradeId: 16,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Biografia',
      description: '',
      active: true,
      GradeId: 16,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Biologia',
      description: '',
      active: true,
      GradeId: 16,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Espanhol',
      description: '',
      active: true,
      GradeId: 16,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Física',
      description: '',
      active: true,
      GradeId: 16,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Geografia',
      description: '',
      active: true,
      GradeId: 16,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Gramática',
      description: '',
      active: true,
      GradeId: 16,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'História',
      description: '',
      active: true,
      GradeId: 16,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'História do Brasil',
      description: '',
      active: true,
      GradeId: 16,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'História Geral',
      description: '',
      active: true,
      GradeId: 16,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Inglês',
      description: '',
      active: true,
      GradeId: 16,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Literatura',
      description: '',
      active: true,
      GradeId: 16,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Matemática',
      description: '',
      active: true,
      GradeId: 16,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Língua Portuguesa',
      description: '',
      active: true,
      GradeId: 16,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Química',
      description: '',
      active: true,
      GradeId: 16,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Redação',
      description: '',
      active: true,
      GradeId: 16,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Guerras Mundiais',
      description: '',
      active: true,
      GradeId: 16,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Artes',
      description: '',
      active: true,
      GradeId: 17,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Biografia',
      description: '',
      active: true,
      GradeId: 17,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Biologia',
      description: '',
      active: true,
      GradeId: 17,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Espanhol',
      description: '',
      active: true,
      GradeId: 17,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Física',
      description: '',
      active: true,
      GradeId: 17,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Geografia',
      description: '',
      active: true,
      GradeId: 17,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Gramática',
      description: '',
      active: true,
      GradeId: 17,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'História',
      description: '',
      active: true,
      GradeId: 17,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'História do Brasil',
      description: '',
      active: true,
      GradeId: 17,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'História Geral',
      description: '',
      active: true,
      GradeId: 17,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Inglês',
      description: '',
      active: true,
      GradeId: 17,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Literatura',
      description: '',
      active: true,
      GradeId: 17,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Matemática',
      description: '',
      active: true,
      GradeId: 17,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Língua Portuguesa',
      description: '',
      active: true,
      GradeId: 17,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Química',
      description: '',
      active: true,
      GradeId: 17,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Redação',
      description: '',
      active: true,
      GradeId: 17,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Guerras Mundiais',
      description: '',
      active: true,
      GradeId: 17,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Artes',
      description: '',
      active: true,
      GradeId: 18,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Biografia',
      description: '',
      active: true,
      GradeId: 18,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Biologia',
      description: '',
      active: true,
      GradeId: 18,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Espanhol',
      description: '',
      active: true,
      GradeId: 18,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Física',
      description: '',
      active: true,
      GradeId: 18,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Geografia',
      description: '',
      active: true,
      GradeId: 18,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Gramática',
      description: '',
      active: true,
      GradeId: 18,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'História',
      description: '',
      active: true,
      GradeId: 18,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'História do Brasil',
      description: '',
      active: true,
      GradeId: 18,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'História Geral',
      description: '',
      active: true,
      GradeId: 18,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Inglês',
      description: '',
      active: true,
      GradeId: 18,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Literatura',
      description: '',
      active: true,
      GradeId: 18,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Matemática',
      description: '',
      active: true,
      GradeId: 18,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Língua Portuguesa',
      description: '',
      active: true,
      GradeId: 18,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Química',
      description: '',
      active: true,
      GradeId: 18,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Redação',
      description: '',
      active: true,
      GradeId: 18,
      createdAt: new Date(),
      updatedAt: new Date()
     },
     {
      title: 'Guerras Mundiais',
      description: '',
      active: true,
      GradeId: 18,
      createdAt: new Date(),
      updatedAt: new Date()
     }
   ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete({
      tableName: 'Subjects'
    }, null, {});
  }
};
