'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Class_Plan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.Class_Plan.belongsTo(models.Area)
      models.Class_Plan.belongsTo(models.Subject)
      models.Class_Plan.belongsTo(models.Level)
      models.Class_Plan.belongsTo(models.Grade)
      models.Class_Plan.belongsTo(models.Course)
      models.Class_Plan.hasMany(models.Class_Plan_Content)
    }
  };
  Class_Plan.init({
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    photo: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Class_Plan',
  });
  return Class_Plan;
};