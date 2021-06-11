'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Report extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Report.init({
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    cols: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    where: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    where_next: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Report',
  });
  return Report;
};