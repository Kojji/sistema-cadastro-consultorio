'use strict';
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "../../config/vars";
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // define association here
    }

    static passwordMatches(password, modelPassword) {
      return bcrypt.compare(password, modelPassword)
    }

    static sign(user) {
      const token = jwt.sign(
        {
          id: user.id,
          role: user.role,
          createdAt: user.createdAt,
          expiresIn: 3600 * 2
        },
        config.jwtSecret
      );

      return token;
    }

    static async passwordHash(password) {
      const hash = await bcrypt.hash(password, config.env === 'development' ? 1 : 10)

      return hash;
    }

    static sideMenu(role) {
      const menu = [];
      
      if (role === 1) {
        menu.push({
          label: 'Fichas',
          url: '/fichas',
          external: false,
          icon: 'topic'
        })

        menu.push({
          label: 'Usuários',
          url: '/usuarios',
          external: false,
          icon: 'group'
        })
      } else if(role === 2) {
        menu.push({
          label: 'Fichas',
          url: '/fichas',
          external: false,
          icon: 'topic'
        })
      }

      return menu;
    }
  };
  User.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true
    },
    confirmed: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    photo: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    birthday: {
      type: DataTypes.STRING,
      allowNull: true
    },
    cpf: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true
    },
    role: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};