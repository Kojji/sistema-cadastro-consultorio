'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Subject extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.Subject.belongsTo(models.Grade)
      models.Subject.hasMany(models.Feed_Area_Level_Course_Grade_Subject)
      models.Subject.hasMany(models.Question_Database)
    }
  };
  Subject.init({
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
    modelName: 'Subject',
  });
  return Subject;
};