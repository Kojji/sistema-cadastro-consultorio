'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Inquiry extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.Inquiry.belongsTo(models.Feed)
      models.Inquiry.belongsTo(models.User)
      models.Inquiry.hasMany(models.Inquiry_Option)
      models.Inquiry.hasMany(models.Inquiry_Answer)
    }
  };
  Inquiry.init({
    question: {
      type: DataTypes.TEXT,
      allowNull: false,
      default: ''
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Inquiry',
  });
  return Inquiry;
};