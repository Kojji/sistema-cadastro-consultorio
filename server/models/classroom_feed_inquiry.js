'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Classroom_Feed_Inquiry extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.Classroom_Feed_Inquiry.belongsTo(models.Professor)
      models.Classroom_Feed_Inquiry.belongsTo(models.Classroom_Feed)
      models.Classroom_Feed_Inquiry.hasMany(models.Classroom_Feed_Inquiry_Option)
      models.Classroom_Feed_Inquiry.hasMany(models.Classroom_Feed_Inquiry_Answer)
    }
  };
  Classroom_Feed_Inquiry.init({
    question: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Classroom_Feed_Inquiry',
  });
  return Classroom_Feed_Inquiry;
};