'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Class_Plan_Content extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.Class_Plan_Content.belongsTo(models.Class_Plan)
      models.Class_Plan_Content.hasMany(models.Class_Plan_Content_Page)
    }
  };
  Class_Plan_Content.init({
    title: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Class_Plan_Content',
  });
  return Class_Plan_Content;
};