'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Question_Database extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.Question_Database.belongsTo(models.File)
      models.Question_Database.belongsTo(models.Grade)
      models.Question_Database.belongsTo(models.Level)
      models.Question_Database.belongsTo(models.Subject)
      models.Question_Database.belongsTo(models.Course)
      models.Question_Database.hasMany(models.Question_Database_Option)
      models.Question_Database.hasMany(models.Question_Database_Tag)
      models.Question_Database.hasMany(models.Question_Database_Flag)
    }
  };
  Question_Database.init({
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      default: ''
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
      default: ''
    },
    question: {
      type: DataTypes.TEXT,
      allowNull: false,
      default: ''
    },
    justification: {
      type: DataTypes.TEXT,
      allowNull: true,
      default: ''
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      default: false
    },
  }, {
    sequelize,
    modelName: 'Question_Database',
  });
  return Question_Database;
};