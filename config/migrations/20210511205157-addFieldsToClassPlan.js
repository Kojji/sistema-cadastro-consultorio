'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => await queryInterface.addColumn(
    {
      tableName: 'Class_Plan_Content_Page_Items'
    },
    'source_video',
    {
      type: Sequelize.STRING,
      default: '',
      defaultValue: '',
      allowNull: true
    }
  ).then(() => queryInterface.addColumn(
    {
      tableName: 'Class_Plan_Content_Page_Items'
    },
    'url_video',
    {
      type: Sequelize.STRING,
      default: '',
      defaultValue: '',
      allowNull: true
    }
  )),

  down: async (queryInterface, Sequelize) => await queryInterface.removeColumn(
    {
      tableName: 'Class_Plan_Content_Page_Items'
    },
    'source_video'
    ).then(() => queryInterface.removeColumn(
      {
        tableName: 'Class_Plan_Content_Page_Items'
      },
      'url_video'
      ))
};
