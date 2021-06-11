'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Activity extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.Activity.belongsTo(models.Classroom)
      models.Activity.hasMany(models.Activity_Question_Student_File)
      models.Activity.hasMany(models.Activity_Question)
      models.Activity.hasMany(models.Activity_Question_Answer)
      models.Activity.hasMany(models.Activity_Result)
    }
  };
  Activity.init({
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      default: ''
    },
    deadline: {
      type: DataTypes.DATE,
      allowNull: false
    },
    timer: {
      type: DataTypes.STRING,
      allowNull: true,
      default: null
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      default: ''
    },
    total_score: {
      type: DataTypes.FLOAT,
      allowNull: false,
      default: 0
    },
    ActivityDatabaseId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      default: null
    }
  }, {
    sequelize,
    modelName: 'Activity',
  });
  return Activity;
};