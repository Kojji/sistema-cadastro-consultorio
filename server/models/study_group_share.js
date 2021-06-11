'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Study_Group_Share extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.Study_Group_Share.belongsTo(models.User)
      models.Study_Group_Share.belongsTo(models.Study_Group, {foreignKey: 'StudyGroupId'})
      models.Study_Group_Share.belongsTo(models.File)
    }
  };
  Study_Group_Share.init({
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: ''
    },
    video_url: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    }
  }, {
    sequelize,
    modelName: 'Study_Group_Share',
  });
  return Study_Group_Share;
};