'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Classroom extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.Classroom.belongsTo(models.Professor)
      models.Classroom.belongsTo(models.Course)
      models.Classroom.belongsTo(models.Subject)
      models.Classroom.belongsTo(models.Level)
      models.Classroom.hasMany(models.Classroom_Student)
      models.Classroom.hasMany(models.Classroom_Feed)
      models.Classroom.hasMany(models.Activity)
      models.Classroom.hasMany(models.Classroom_Code)
      models.Classroom.hasMany(models.Activity_Class_Teach)
    }
  };
  Classroom.init({
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      default: true
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
      default: ''
    },
    courseName: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Classroom',
  });
  return Classroom;
};