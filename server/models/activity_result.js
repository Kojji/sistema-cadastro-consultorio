'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Activity_Result extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.Activity_Result.belongsTo(models.Student)
      models.Activity_Result.belongsTo(models.Activity)
    }
  };
  Activity_Result.init({
    revised: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      default: false
    },
    finalized: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      default: false
    },
    student_score: {
      type: DataTypes.FLOAT,
      allowNull: false,
      default: 0
    }
  }, {
    sequelize,
    modelName: 'Activity_Result',
  });
  return Activity_Result;
};