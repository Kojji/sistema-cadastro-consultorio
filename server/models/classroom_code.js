'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Classroom_Code extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.Classroom_Code.belongsTo(models.Classroom)
    }
  };
  Classroom_Code.init({
    class_code: {
      type: DataTypes.STRING,
      allowNull: false
    },
    path_url: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Classroom_Code',
  });
  return Classroom_Code;
};