'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Token_Control extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.Token_Control.belongsTo(models.User)
    }
  };
  Token_Control.init({
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      default: false
    },
    token: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    ip: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Token_Control',
  });
  return Token_Control;
};