'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Permission extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.Permission.hasMany(models.User_Permission)
    }
  };
  Permission.init({
    alias: {
      type: DataTypes.STRING,
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      default: ''
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      default: true
    }
  }, {
    sequelize,
    modelName: 'Permission',
  });
  return Permission;
};