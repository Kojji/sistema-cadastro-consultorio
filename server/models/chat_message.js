'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Chat_Message extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.Chat_Message.belongsTo(models.User, {foreignKey: 'from'})
      models.Chat_Message.belongsTo(models.User, {foreignKey: 'to'})
    }
  };
  Chat_Message.init({
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
      default: ''
    }
  }, {
    sequelize,
    modelName: 'Chat_Message',
  });
  return Chat_Message;
};