'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Support extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Support.init({
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: DataTypes.TEXT,
    url_video: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Support',
  });
  return Support;
};