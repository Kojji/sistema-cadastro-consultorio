'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Activity_Option extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.Activity_Option.belongsTo(models.Activity_Question)
      models.Activity_Option.hasMany(models.Activity_Question_Answer)
    }
  };
  Activity_Option.init({
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
    modelName: 'Activity_Option',
  });
  return Activity_Option;
};