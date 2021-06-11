'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Activity_Class_Teach extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.Activity_Class_Teach.belongsTo(models.Classroom)
      models.Activity_Class_Teach.hasMany(models.Activity_Class_Teach_Student, {foreignKey: 'ActivityClassTeachId'})
    }
  };
  Activity_Class_Teach.init({
    description: {
      type: DataTypes.TEXT
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    deadline: {
      type: DataTypes.DATE,
      allowNull: true
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false 
    }
  }, {
    sequelize,
    modelName: 'Activity_Class_Teach',
  });
  return Activity_Class_Teach;
};