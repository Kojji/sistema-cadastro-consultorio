'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Tag extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.Tag.hasMany(models.Question_Database_Tag)
    }
  };
  Tag.init({
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      default: ''
    }
  }, {
    sequelize,
    modelName: 'Tag',
  });
  return Tag;
};