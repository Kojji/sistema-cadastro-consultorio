'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Study_Group extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.Study_Group.hasMany(models.Study_Group_User, {foreignKey: 'StudyGroupId'})
      models.Study_Group.hasMany(models.Study_Group_Message, {foreignKey: 'StudyGroupId'})
      models.Study_Group.hasMany(models.Study_Group_Share, {foreignKey: 'StudyGroupId'})
    }
  };
  Study_Group.init({
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: ''
    },
    code:{
      type: DataTypes.STRING,
      allowNull: false
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    access_code:{
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Study_Group',
  });
  return Study_Group;
};