'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Classroom_Feed_Inquiry_Answer extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.Classroom_Feed_Inquiry_Answer.belongsTo(models.Classroom_Feed_Inquiry)
      models.Classroom_Feed_Inquiry_Answer.belongsTo(models.Classroom_Feed_Inquiry_Option)
      models.Classroom_Feed_Inquiry_Answer.belongsTo(models.Student)
    }
  };
  Classroom_Feed_Inquiry_Answer.init({
  }, {
    sequelize,
    modelName: 'Classroom_Feed_Inquiry_Answer',
  });
  return Classroom_Feed_Inquiry_Answer;
};