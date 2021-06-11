'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User_Chat_Conversation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.User_Chat_Conversation.belongsTo(models.User, {as: 'other', foreignKey: 'from'})
      models.User_Chat_Conversation.belongsTo(models.User, {foreignKey: 'to'})
    }
  };
  User_Chat_Conversation.init({
    unread_messages: {
      type: DataTypes.INTEGER,
      allowNull: false,
      default: 0
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      default: true
    }
  }, {
    sequelize,
    modelName: 'User_Chat_Conversation',
  });
  return User_Chat_Conversation;
};