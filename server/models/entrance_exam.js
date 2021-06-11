'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Entrance_Exam extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.Entrance_Exam.hasMany(models.Entrance_Exam_Content)
    }
  };
  Entrance_Exam.init({
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    photo: DataTypes.STRING,
    description: DataTypes.TEXT,
    type: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Entrance_Exam',
  });
  return Entrance_Exam;
};