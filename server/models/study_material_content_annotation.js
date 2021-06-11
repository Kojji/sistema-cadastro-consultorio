'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Study_Material_Content_Annotation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.Study_Material_Content_Annotation.belongsTo(models.Study_Material_Content)
      models.Study_Material_Content_Annotation.belongsTo(models.User)
    }
  };
  Study_Material_Content_Annotation.init({
    content: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Study_Material_Content_Annotation',
  });
  return Study_Material_Content_Annotation;
};