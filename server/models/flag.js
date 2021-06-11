'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Flag extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.Flag.hasMany(models.Question_Database_Flag)
    }
  };
  Flag.init({
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      default: ''
    },
    fixed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      default: false
    }
  }, {
    sequelize,
    modelName: 'Flag',
  });
  return Flag;
};