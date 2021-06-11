'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Activity_Option_Database extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.Activity_Option_Database.belongsTo(models.Activity_Question_Database)
    }
  };
  Activity_Option_Database.init({
    option: {
      type: DataTypes.STRING,
      allowNull: false
    },
    correct: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      default: false
    }
  }, {
    sequelize,
    modelName: 'Activity_Option_Database',
  });
  return Activity_Option_Database;
};