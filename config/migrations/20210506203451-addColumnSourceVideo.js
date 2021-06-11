'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => await queryInterface.addColumn(
    {
      tableName: 'Workshop_Module_Classes'
    },
    'source_video',
    {
      type: Sequelize.STRING,
      default: '',
      defaultValue: '',
      allowNull: false
    }
  ).then(() => queryInterface.addColumn(
    {
      tableName: 'Study_Material_Contents'
    },
    'source_video',
    {
      type: Sequelize.STRING,
      default: '',
      defaultValue: '',
      allowNull: false
    }
  )).then(() => queryInterface.addColumn(
    {
      tableName: 'Entrance_Exam_Contents'
    },
    'source_video',
    {
      type: Sequelize.STRING,
      default: '',
      defaultValue: '',
      allowNull: false
    }
  )),

  down: async (queryInterface, Sequelize) => await queryInterface.removeColumn(
    {
      tableName: 'Workshop_Module_Classes'
    },
    'source_video'
  ).then(() => queryInterface.removeColumn(
    {
      tableName: 'Study_Material_Contents'
    },
    'source_video'
  )).then(() => queryInterface.removeColumn(
    {
      tableName: 'Entrance_Exam_Contents'
    },
    'source_video'
  ))
};
