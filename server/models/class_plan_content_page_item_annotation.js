'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Class_Plan_Content_Page_Item_Annotation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.Class_Plan_Content_Page_Item_Annotation.belongsTo(models.Class_Plan_Content_Page_Item)
      models.Class_Plan_Content_Page_Item_Annotation.belongsTo(models.User)
    }
  };
  Class_Plan_Content_Page_Item_Annotation.init({
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '',
      default: ''
    }
  }, {
    sequelize,
    modelName: 'Class_Plan_Content_Page_Item_Annotation',
  });
  return Class_Plan_Content_Page_Item_Annotation;
};