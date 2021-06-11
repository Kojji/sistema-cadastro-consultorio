'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User_Permission extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.User_Permission.belongsTo(models.User)
      models.User_Permission.belongsTo(models.Permission)
    }
  };
  User_Permission.init({
  }, {
    sequelize,
    modelName: 'User_Permission',
  });
  return User_Permission;
};