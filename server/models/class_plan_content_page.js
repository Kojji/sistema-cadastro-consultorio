'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Class_Plan_Content_Page extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.Class_Plan_Content_Page.belongsTo(models.Class_Plan_Content)
      models.Class_Plan_Content_Page.hasMany(models.Class_Plan_Content_Page_Item)
    }
  };
  Class_Plan_Content_Page.init({
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Class_Plan_Content_Page',
  });
  return Class_Plan_Content_Page;
};