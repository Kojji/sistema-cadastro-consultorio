'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Classroom_Feed_Inquiry_Option extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.Classroom_Feed_Inquiry_Option.belongsTo(models.Classroom_Feed_Inquiry)
      models.Classroom_Feed_Inquiry_Option.hasMany(models.Classroom_Feed_Inquiry_Answer)
    }
  };
  Classroom_Feed_Inquiry_Option.init({
    option: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    correct: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Classroom_Feed_Inquiry_Option',
  });
  return Classroom_Feed_Inquiry_Option;
};