'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Feed extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.Feed.belongsTo(models.User)
      models.Feed.belongsTo(models.File)
      models.Feed.hasOne(models.Inquiry)
      models.Feed.hasMany(models.Feed_Area_Level_Course_Grade_Subject)
      models.Feed.hasMany(models.Favorite)
      models.Feed.hasMany(models.Comment)
    }
  };
  Feed.init({
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    content_type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      default: ''
    },
    approved: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    video_url: {
      type: DataTypes.STRING,
      allowNull: true,
      default: null
    }
  }, {
    sequelize,
    modelName: 'Feed',
  });
  return Feed;
};