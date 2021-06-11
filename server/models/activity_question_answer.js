'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Activity_Question_Answer extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.Activity_Question_Answer.belongsTo(models.Student)
      models.Activity_Question_Answer.belongsTo(models.Activity_Option)
      models.Activity_Question_Answer.belongsTo(models.Activity_Question)
      models.Activity_Question_Answer.belongsTo(models.Activity)
    }
  };
  Activity_Question_Answer.init({
    answer: {
      type: DataTypes.TEXT,
      allowNull: true,
      default: null
    },
    revised: {
      type: DataTypes.INTEGER,
      allowNull: false,
      default: 0
    },
    correct: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      default: null
    },
    question_score: {
      type: DataTypes.FLOAT,
      allowNull: false,
      default: 0
    }
  }, {
    sequelize,
    modelName: 'Activity_Question_Answer',
  });
  return Activity_Question_Answer;
};