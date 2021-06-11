'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Question_Database_Tag extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.Question_Database_Tag.belongsTo(models.Question_Database)
      models.Question_Database_Tag.belongsTo(models.Tag)
    }
  };
  Question_Database_Tag.init({
  }, {
    sequelize,
    modelName: 'Question_Database_Tag',
  });
  return Question_Database_Tag;
};