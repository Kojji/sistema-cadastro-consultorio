'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User_Area extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.User_Area.belongsTo(models.User)
      models.User_Area.belongsTo(models.Area)
    }
  };
  User_Area.init({
  }, {
    sequelize,
    modelName: 'User_Area',
  });
  return User_Area;
};