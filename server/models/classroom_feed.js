'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Classroom_Feed extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.Classroom_Feed.belongsTo(models.Professor)
      models.Classroom_Feed.belongsTo(models.File)
      models.Classroom_Feed.belongsTo(models.Classroom)
      models.Classroom_Feed.hasOne(models.Classroom_Feed_Inquiry)
      models.Classroom_Feed.hasMany(models.Classroom_Feed_Comment)
    }
  };
  Classroom_Feed.init({
    content_type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: ''
    },
    video_url: {
      type: DataTypes.STRING,
      allowNull: true,
      default: null
    }
  }, {
    sequelize,
    modelName: 'Classroom_Feed',
  });
  return Classroom_Feed;
};