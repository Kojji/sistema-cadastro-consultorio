'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Classroom_Feed_Comment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.Classroom_Feed_Comment.belongsTo(models.Classroom_Feed)
      models.Classroom_Feed_Comment.belongsTo(models.Professor)
      models.Classroom_Feed_Comment.belongsTo(models.Student)
      models.Classroom_Feed_Comment.belongsTo(models.User)
    }
  };
  Classroom_Feed_Comment.init({
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    father: {
      type: DataTypes.INTEGER,
      allowNull: true,
      default: null
    }
  }, {
    sequelize,
    modelName: 'Classroom_Feed_Comment',
  });
  return Classroom_Feed_Comment;
};