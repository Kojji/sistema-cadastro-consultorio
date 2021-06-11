'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Activity_Database extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.Activity_Database.belongsTo(models.User)
      models.Activity_Database.hasMany(models.Activity_Question_Database)
    }
  };
  Activity_Database.init({
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      default: ''
    },
    timer: {
      type: DataTypes.STRING,
      allowNull: true,
      default: null
    },
    total_score: {
      type: DataTypes.FLOAT,
      allowNull: false,
      default: 0
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      default: ''
    }
  }, {
    sequelize,
    modelName: 'Activity_Database',
  });
  return Activity_Database;
};