'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Entrance_Exam_Content_Annotation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.Entrance_Exam_Content_Annotation.belongsTo(models.Entrance_Exam_Content)
      models.Entrance_Exam_Content_Annotation.belongsTo(models.User)
    }
  };
  Entrance_Exam_Content_Annotation.init({
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '',
      default: ''
    }
  }, {
    sequelize,
    modelName: 'Entrance_Exam_Content_Annotation',
  });
  return Entrance_Exam_Content_Annotation;
};