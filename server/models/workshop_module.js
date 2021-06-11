'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Workshop_Module extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.Workshop_Module.belongsTo(models.Workshop)
      models.Workshop_Module.hasMany(models.Workshop_Module_Class)
    }
  };
  Workshop_Module.init({
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    available_in: {
      type: DataTypes.INTEGER,
      allowNull: false,
      default: 0,
      defaultValue: 0
    }
  }, {
    sequelize,
    modelName: 'Workshop_Module',
  });
  return Workshop_Module;
};