'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Classroom_Student extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.Classroom_Student.belongsTo(models.Classroom)
      models.Classroom_Student.belongsTo(models.Student)
    }
  };
  Classroom_Student.init({
    active: {
      type: DataTypes.BOOLEAN,
      default: true,
      allowNull: false
    },
    absences: {
      type: DataTypes.INTEGER,
      allowNull: false,
      default: 0
    },
    attendance: {
      type: DataTypes.INTEGER,
      allowNull: false,
      default: 0
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      default: '0'
    },
    points: {
      type: DataTypes.FLOAT,
      allowNull: false,
      default: 0.0,
      defaultValue: 0.0
    },
    performance: {
      type: DataTypes.INTEGER,
      allowNull: false,
      default: 0,
      defaultValue: 0
    },
    performance_negative: {
      type: DataTypes.INTEGER,
      allowNull: false,
      default: 0,
      defaultValue: 0
    }
  }, {
    sequelize,
    modelName: 'Classroom_Student',
  });
  return Classroom_Student;
};