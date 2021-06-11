'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Student extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // models.Student.belongsTo(models.Course)
      models.Student.belongsTo(models.Grade)
      models.Student.belongsTo(models.User)
      models.Student.belongsTo(models.Level)
      models.Student.hasMany(models.Classroom_Student)
      models.Student.hasMany(models.Classroom_Feed_Inquiry_Answer)
      models.Student.hasMany(models.Classroom_Feed_Comment)
      models.Student.hasMany(models.Activity_Question_Student_File)
      models.Student.hasMany(models.Activity_Question_Answer)
      models.Student.hasMany(models.Activity_Result)
      models.Student.hasMany(models.Activity_Class_Teach_Student)
    }
  };
  Student.init({
    active: {
      type: DataTypes.BOOLEAN,
      default: true,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Student',
  });
  return Student;
};