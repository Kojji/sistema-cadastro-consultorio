'use strict';
import fs from 'fs';
import APIError from '../helpers/APIError';

const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class File extends Model {
    static associate(models) {
      models.File.belongsTo(models.User)
      models.File.belongsTo(models.Institution)
      models.File.hasOne(models.Feed)
      models.File.hasOne(models.Classroom_Feed)
      models.File.hasOne(models.Activity_Question_Student_File)
      models.File.hasMany(models.Activity_Question)
      models.File.hasMany(models.Question_Database)
      models.File.hasMany(models.Activity_Question_Database)
      models.File.hasMany(models.Workshop_Module_Class_File)
      models.File.hasMany(models.Activity_Class_Teach_Student)
      models.File.hasMany(models.Study_Group_Share)
    }

    static async deleteAndDestroy(fileToDelete) {
      try{ 
        let removePath = fileToDelete.path_storage
        const removeFile = await fileToDelete.destroy({});
  
        if (!removeFile) {
          throw new APIError("Houve um erro ao excluir o arquivo.");
        }
  
        fs.unlink(removePath, (err) => {
          if (err) throw new APIError("Houve um erro ao remover o arquivo.");
        })
        return true;
      } catch(err) {
        return false;
      }
    }
  };
  File.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    folder: {
      type: DataTypes.STRING,
      allowNull: false
    },
    path_storage: {
      type: DataTypes.STRING,
      allowNull: false
    },
    url_storage: {
      type: DataTypes.STRING,
      allowNull: false
    },
    schemaname: {
      type: DataTypes.STRING,
      allowNull: true,
      default: ''
    },
    areas: {
      type: DataTypes.STRING,
      allowNull: true,
      default: null
    },
    subjects: {
      type: DataTypes.STRING,
      allowNull: true,
      default: null
    },
    levels: {
      type: DataTypes.STRING,
      allowNull: true,
      default: null
    },
    grades: {
      type: DataTypes.STRING,
      allowNull: true,
      default: null
    },
    courses: {
      type: DataTypes.STRING,
      allowNull: true,
      default: null
    }
  }, {
    sequelize,
    modelName: 'File',
  });
  return File;
};