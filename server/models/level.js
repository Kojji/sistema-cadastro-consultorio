'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Level extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.Level.hasMany(models.Grade)
      models.Level.hasMany(models.Student)
      models.Level.hasMany(models.Classroom)
      models.Level.hasMany(models.Course)
      models.Level.hasMany(models.Feed_Area_Level_Course_Grade_Subject)
      models.Level.hasMany(models.Question_Database)
    }
  };
  Level.init({
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      default: ''
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      default: true
    },
  }, {
    sequelize,
    modelName: 'Level',
  });
  return Level;
};