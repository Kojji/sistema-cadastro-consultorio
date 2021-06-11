'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Inquiry_Answer extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.Inquiry_Answer.belongsTo(models.User)
      models.Inquiry_Answer.belongsTo(models.Inquiry_Option)
      models.Inquiry_Answer.belongsTo(models.Inquiry)
    }
  };
  Inquiry_Answer.init({
  }, {
    sequelize,
    modelName: 'Inquiry_Answer',
  });
  return Inquiry_Answer;
};