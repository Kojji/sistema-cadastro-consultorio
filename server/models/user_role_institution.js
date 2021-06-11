'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User_Role_Institution extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.User_Role_Institution.belongsTo(models.User)
      models.User_Role_Institution.belongsTo(models.Role)
      models.User_Role_Institution.belongsTo(models.Institution)
    }
  };
  User_Role_Institution.init({}, {
    sequelize,
    modelName: 'User_Role_Institution',
  });
  return User_Role_Institution;
};