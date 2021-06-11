'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Institutions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        default: ''
      },
      cep: {
        type: Sequelize.STRING,
        allowNull: false,
        default: ''
      },
      city: {
        type: Sequelize.STRING,
        allowNull: false,
        default: ''
      },
      state: {
        type: Sequelize.STRING,
        allowNull: false,
        default: ''
      },
      district: {
        type: Sequelize.STRING,
        allowNull: false,
        default: ''
      },
      address: {
        type: Sequelize.STRING,
        allowNull: false,
        default: ''
      },
      number: {
        type: Sequelize.STRING,
        allowNull: false,
        default: ''
      },
      complement: {
        type: Sequelize.STRING,
        allowNull: false,
        default: ''
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: false,
        default: ''
      },
      active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        default: true
      },
      activity: {
        type: Sequelize.STRING,
        allowNull: false,
        default: ''
      },
      tour: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        default: false
      },
      schemaname: {
        type: Sequelize.STRING,
        allowNull: false
      },
      createSchema: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      },
      creatingSchema: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      },
      timezone: {
        type: Sequelize.STRING,
        allowNull: false,
        default: 'America/Sao_Paulo'
      },
      photo: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Institutions');
  }
};