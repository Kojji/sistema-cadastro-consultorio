'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Study_Material_Content extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.Study_Material_Content.belongsTo(models.Study_Material)
      models.Study_Material_Content.hasOne(models.Study_Material_Content_Annotation)
    }
  };
  Study_Material_Content.init({
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT
    },
    url_video: {
      type: DataTypes.STRING
    },
    source_video: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Study_Material_Content',
  });
  return Study_Material_Content;
};