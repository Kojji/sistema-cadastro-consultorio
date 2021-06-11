'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Inquiry_Option extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.Inquiry_Option.belongsTo(models.Inquiry)
      models.Inquiry_Option.hasMany(models.Inquiry_Answer)
    }
  };
  Inquiry_Option.init({
    option: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    correct: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      default: false
    }
  }, {
    sequelize,
    modelName: 'Inquiry_Option',
  });
  return Inquiry_Option;
};