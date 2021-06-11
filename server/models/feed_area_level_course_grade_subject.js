'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Feed_Area_Level_Course_Grade_Subject extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.Feed_Area_Level_Course_Grade_Subject.belongsTo(models.Feed)
      models.Feed_Area_Level_Course_Grade_Subject.belongsTo(models.Area)
      models.Feed_Area_Level_Course_Grade_Subject.belongsTo(models.Level)
      models.Feed_Area_Level_Course_Grade_Subject.belongsTo(models.Course)
      models.Feed_Area_Level_Course_Grade_Subject.belongsTo(models.Grade)
      models.Feed_Area_Level_Course_Grade_Subject.belongsTo(models.Subject)
    }
  };
  Feed_Area_Level_Course_Grade_Subject.init({
  }, {
    sequelize,
    modelName: 'Feed_Area_Level_Course_Grade_Subject',
  });
  return Feed_Area_Level_Course_Grade_Subject;
};