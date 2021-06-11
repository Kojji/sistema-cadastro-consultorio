'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Favorite extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.Favorite.belongsTo(models.Feed)
      models.Favorite.belongsTo(models.User)
    }
  };
  Favorite.init({
  }, {
    sequelize,
    modelName: 'Favorite',
  });
  return Favorite;
};