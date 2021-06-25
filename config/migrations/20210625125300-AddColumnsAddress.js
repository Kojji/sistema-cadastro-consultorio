'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
      {
        tableName: 'Patients'
      },
      'postalCode',
      {
        type: Sequelize.STRING,
        default: null,
        defaultValue: null,
        allowNull: true
      }
    )
    await queryInterface.addColumn(
      {
        tableName: 'Patients'
      },
      'state',
      {
        type: Sequelize.STRING,
        default: null,
        defaultValue: null,
        allowNull: true
      }
    )
    await queryInterface.addColumn(
      {
        tableName: 'Patients'
      },
      'city',
      {
        type: Sequelize.STRING,
        default: null,
        defaultValue: null,
        allowNull: true
      }
    )
    await queryInterface.addColumn(
      {
        tableName: 'Patients'
      },
      'block',
      {
        type: Sequelize.STRING,
        default: null,
        defaultValue: null,
        allowNull: true
      }
    )
    await queryInterface.addColumn(
      {
        tableName: 'Patients'
      },
      'street',
      {
        type: Sequelize.STRING,
        default: null,
        defaultValue: null,
        allowNull: true
      }
    )
    await queryInterface.addColumn(
      {
        tableName: 'Patients'
      },
      'number',
      {
        type: Sequelize.INTEGER,
        default: null,
        defaultValue: null,
        allowNull: true
      }
    )
    await queryInterface.addColumn(
      {
        tableName: 'Patients'
      },
      'extra',
      {
        type: Sequelize.STRING,
        default: null,
        defaultValue: null,
        allowNull: true
      }
    )
    await queryInterface.addColumn(
      {
        tableName: 'Patients'
      },
      'email',
      {
        type: Sequelize.STRING,
        default: null,
        defaultValue: null,
        allowNull: true
      }
    )
    await queryInterface.addColumn(
      {
        tableName: 'Patients'
      },
      'emitReceipt',
      {
        type: Sequelize.BOOLEAN,
        default: false,
        defaultValue: false,
        allowNull: false
      }
    );
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn(
      {
        tableName: 'Patients',
      },
      'postalCode'
    )
    await queryInterface.removeColumn(
      {
        tableName: 'Patients',
      },
      'state'
    )
    await queryInterface.removeColumn(
      {
        tableName: 'Patients',
      },
      'city'
    )
    await queryInterface.removeColumn(
      {
        tableName: 'Patients',
      },
      'block'
    )
    await queryInterface.removeColumn(
      {
        tableName: 'Patients',
      },
      'street'
    )
    await queryInterface.removeColumn(
      {
        tableName: 'Patients',
      },
      'number'
    )
    await queryInterface.removeColumn(
      {
        tableName: 'Patients',
      },
      'extra'
    )
    await queryInterface.removeColumn(
      {
        tableName: 'Patients',
      },
      'email'
    )
    await queryInterface.removeColumn(
      {
        tableName: 'Patients',
      },
      'emitReceipt'
    )
  }
};
