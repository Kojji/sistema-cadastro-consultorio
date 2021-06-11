'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Institution extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.Institution.hasMany(models.User_Role_Institution)
      models.Institution.hasMany(models.User)
      models.Institution.hasMany(models.File)
    }
  };
  Institution.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      default: ''
    },
    cep: {
      type: DataTypes.STRING,
      allowNull: false,
      default: ''
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
      default: ''
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false,
      default: ''
    },
    district: {
      type: DataTypes.STRING,
      allowNull: false,
      default: ''
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
      default: ''
    },
    number: {
      type: DataTypes.STRING,
      allowNull: false,
      default: ''
    },
    complement: {
      type: DataTypes.STRING,
      allowNull: false,
      default: ''
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      default: ''
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      default: true
    },
    activity: {
      type: DataTypes.STRING,
      allowNull: false,
      default: ''
    },
    tour: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      default: false
    },
    schemaname: {
      type: DataTypes.STRING,
      allowNull: false
    },
    createSchema: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    creatingSchema: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    timezone: {
      type: DataTypes.STRING,
      allowNull: false,
      default: 'America/Sao_Paulo'
    },
    photo: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Institution',
  });
  return Institution;
};