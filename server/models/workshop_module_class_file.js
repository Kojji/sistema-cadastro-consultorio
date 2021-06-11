'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Workshop_Module_Class_File extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.Workshop_Module_Class_File.belongsTo(models.Workshop_Module_Class)
      models.Workshop_Module_Class_File.belongsTo(models.File)
    }
  };
  Workshop_Module_Class_File.init({}, {
    sequelize,
    modelName: 'Workshop_Module_Class_File',
  });
  return Workshop_Module_Class_File;
};