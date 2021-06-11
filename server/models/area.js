'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Area extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.Area.hasMany(models.Feed_Area_Level_Course_Grade_Subject)
      models.Area.hasMany(models.User_Area)
    }
  };
  Area.init({
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      default: ''
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      default: ''
    },
    father: {
      type: DataTypes.INTEGER,
      default: null
    },
  }, {
    sequelize,
    modelName: 'Area',
  });
  return Area;
};