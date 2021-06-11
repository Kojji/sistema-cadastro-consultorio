'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      username: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING,
        allowNull: true
      },
      key: {
        type: Sequelize.STRING,
        allowNull: true
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      active: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      },
      confirmed: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      },
      photo: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      tour: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      },
      InstitutionId: {
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'Institutions'
          },
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        allowNull: true
      },
      connected: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      },
      ip_connected: {
        type: Sequelize.STRING,
        allowNull: false
      },
      AreaId: {
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'Areas'
          },
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        allowNull: true
      },
      dtbirth: {
        type: Sequelize.STRING,
        allowNull: true
      },
      cpf: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true
      },
      rg: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true
      },
      profession: {
        type: Sequelize.STRING,
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
    await queryInterface.dropTable('Users');
  }
};