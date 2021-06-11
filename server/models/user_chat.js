'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User_Chat extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.User_Chat.belongsTo(models.User, {foreignKey: 'UserId'})
    }
  };
  User_Chat.init({
    connected: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      default: true
    },
    session: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'User_Chat',
  });
  return User_Chat;
};