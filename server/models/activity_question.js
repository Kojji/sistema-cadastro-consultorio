'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Activity_Question extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.Activity_Question.belongsTo(models.Activity)
      models.Activity_Question.belongsTo(models.File)
      models.Activity_Question.hasMany(models.Activity_Option)
      models.Activity_Question.hasMany(models.Activity_Question_Answer)
      models.Activity_Question.hasMany(models.Activity_Question_Student_File)
    }
  };
  Activity_Question.init({
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    question: {
      type: DataTypes.TEXT,
      allowNull: false,
      default: ''
    },
    timer: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    }, 
    score: {
      type: DataTypes.FLOAT,
      allowNull: false,
      default: 0
    }
  }, {
    sequelize,
    modelName: 'Activity_Question',
  });
  return Activity_Question;
};