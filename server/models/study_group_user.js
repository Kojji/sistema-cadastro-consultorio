'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Study_Group_User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.Study_Group_User.belongsTo(models.User)
      models.Study_Group_User.belongsTo(models.Study_Group, {foreignKey: 'StudyGroupId'})
    }
  };
  Study_Group_User.init({
    isAdmin: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: ''
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    online: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    unread_messages: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
  }, {
    sequelize,
    modelName: 'Study_Group_User',
  });
  return Study_Group_User;
};