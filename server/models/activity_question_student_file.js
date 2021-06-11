'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Activity_Question_Student_File extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.Activity_Question_Student_File.belongsTo(models.Activity)
      models.Activity_Question_Student_File.belongsTo(models.Activity_Question)
      models.Activity_Question_Student_File.belongsTo(models.Student)
      models.Activity_Question_Student_File.belongsTo(models.File)
    }
  };
  Activity_Question_Student_File.init({
  }, {
    sequelize,
    modelName: 'Activity_Question_Student_File',
  });
  return Activity_Question_Student_File;
};