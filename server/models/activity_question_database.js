'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Activity_Question_Database extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.Activity_Question_Database.belongsTo(models.Activity_Database);
      models.Activity_Question_Database.belongsTo(models.File);
      models.Activity_Question_Database.hasMany(models.Activity_Option_Database);
    }
  };
  Activity_Question_Database.init({
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    question: {
      type: DataTypes.TEXT,
      allowNull: false,
      default: ''
    },
    score: {
      type: DataTypes.FLOAT,
      allowNull: false,
      default: 0
    }
  }, {
    sequelize,
    modelName: 'Activity_Question_Database',
  });
  return Activity_Question_Database;
};