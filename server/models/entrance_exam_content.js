'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Entrance_Exam_Content extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.Entrance_Exam_Content.belongsTo(models.Entrance_Exam)
      models.Entrance_Exam_Content.hasOne(models.Entrance_Exam_Content_Annotation)
    }
  };
  Entrance_Exam_Content.init({
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
    url_video: DataTypes.STRING,
    source_video: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Entrance_Exam_Content',
  });
  return Entrance_Exam_Content;
};