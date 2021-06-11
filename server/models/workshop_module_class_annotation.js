'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Workshop_Module_Class_Annotation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.Workshop_Module_Class_Annotation.belongsTo(models.Workshop_Module_Class)
      models.Workshop_Module_Class_Annotation.belongsTo(models.User)
    }
  };
  Workshop_Module_Class_Annotation.init({
    content: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Workshop_Module_Class_Annotation',
  });
  return Workshop_Module_Class_Annotation;
};