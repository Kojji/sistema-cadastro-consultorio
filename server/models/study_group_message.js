'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Study_Group_Message extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.Study_Group_Message.belongsTo(models.User)
      models.Study_Group_Message.belongsTo(models.Study_Group, {foreignKey: 'StudyGroupId'})
    }
  };
  Study_Group_Message.init({
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    }    
  }, {
    sequelize,
    modelName: 'Study_Group_Message',
  });
  return Study_Group_Message;
};