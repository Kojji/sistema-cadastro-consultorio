'use strict';
const { stubFalse } = require('lodash');
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Activity_Class_Teach_Student extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.Activity_Class_Teach_Student.belongsTo(models.Activity_Class_Teach, {foreignKey: 'ActivityClassTeachId'})
      models.Activity_Class_Teach_Student.belongsTo(models.Student)
      models.Activity_Class_Teach_Student.belongsTo(models.File)
    }
  };
  Activity_Class_Teach_Student.init({
    sent: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    // status: 
    // 0 - default
    // 1 - aceito
    // 2 - esperando revisão
    // 3 - recusado
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    type: {
      type: DataTypes.STRING,
      allowNull: true
    },
    video_url: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Activity_Class_Teach_Student',
  });
  return Activity_Class_Teach_Student;
};