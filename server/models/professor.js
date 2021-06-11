'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Professor extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.Professor.belongsTo(models.User)
      models.Professor.hasMany(models.Classroom)
      models.Professor.hasMany(models.Classroom_Feed)
      models.Professor.hasMany(models.Classroom_Feed_Inquiry)
      models.Professor.hasMany(models.Classroom_Feed_Comment)
    }
  };
  Professor.init({
    active: {
      type: DataTypes.BOOLEAN,
      default: true,
      allowNull: false
    },
    institution_email: DataTypes.STRING,
    institution_phone: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Professor',
  });
  return Professor;
};