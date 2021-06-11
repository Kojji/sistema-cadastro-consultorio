'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Class_Plan_Content_Page_Item extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.Class_Plan_Content_Page_Item.belongsTo(models.Class_Plan_Content_Page)
      models.Class_Plan_Content_Page_Item.hasOne(models.Class_Plan_Content_Page_Item_Annotation)
    }
  };
  Class_Plan_Content_Page_Item.init({
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    url_video: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: '',
      default: ''
    },
    source_video: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: '',
      default: ''
    }
  }, {
    sequelize,
    modelName: 'Class_Plan_Content_Page_Item',
  });
  return Class_Plan_Content_Page_Item;
};