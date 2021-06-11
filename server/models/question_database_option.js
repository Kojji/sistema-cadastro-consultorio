'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Question_Database_Option extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.Question_Database_Option.belongsTo(models.Question_Database)
    }
  };
  Question_Database_Option.init({
    option: {
      type: DataTypes.STRING,
      allowNull: false,
      default: ''
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
      default: ''
    },
    correct: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      default: false
    }
  }, {
    sequelize,
    modelName: 'Question_Database_Option',
  });
  return Question_Database_Option;
};