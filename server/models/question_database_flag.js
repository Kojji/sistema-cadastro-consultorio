'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Question_Database_Flag extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.Question_Database_Flag.belongsTo(models.Flag)
      models.Question_Database_Flag.belongsTo(models.Question_Database)
    }
  };
  Question_Database_Flag.init({
  }, {
    sequelize,
    modelName: 'Question_Database_Flag',
  });
  return Question_Database_Flag;
};