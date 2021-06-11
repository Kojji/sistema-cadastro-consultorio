'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Workshop_Module_Class extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.Workshop_Module_Class.belongsTo(models.Workshop_Module)
      models.Workshop_Module_Class.hasMany(models.Workshop_Module_Class_File)
      models.Workshop_Module_Class.hasOne(models.Workshop_Module_Class_Annotation)
    }
  };
  Workshop_Module_Class.init({
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    url_video: {
      type: DataTypes.STRING,
      allowNull: false
    },
    source_video: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Workshop_Module_Class',
  });
  return Workshop_Module_Class;
};