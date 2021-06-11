'use strict';
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import config from "../../config/vars";
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.User.belongsTo(models.Institution)
      models.User.hasMany(models.User_Role_Institution)
      models.User.hasMany(models.File)
      models.User.hasMany(models.Feed)
      models.User.hasMany(models.Student)
      models.User.hasMany(models.Professor)
      models.User.hasMany(models.Favorite)
      models.User.hasMany(models.Inquiry_Answer)
      models.User.hasMany(models.Inquiry)
      models.User.hasMany(models.Classroom_Feed_Comment)
      models.User.hasMany(models.Activity_Database)
      models.User.hasMany(models.User_Chat)
      models.User.hasMany(models.Chat_Message, {foreignKey: 'to'})
      models.User.hasMany(models.Chat_Message, {foreignKey: 'from'})
      models.User.hasMany(models.User_Chat_Conversation, {foreignKey: 'to'})
      models.User.hasMany(models.User_Chat_Conversation, {foreignKey: 'from'})
      models.User.hasMany(models.Token_Control)
      models.User.hasMany(models.User_Permission)
      models.User.hasMany(models.User_Area)
      models.User.hasOne(models.Workshop_Module_Class_Annotation)
      models.User.hasOne(models.Entrance_Exam_Content_Annotation)
      models.User.hasOne(models.Class_Plan_Content_Page_Item_Annotation)
      models.User.hasMany(models.Study_Group_User)
      models.User.hasMany(models.Study_Group_Message)
      models.User.hasMany(models.Study_Group_Share)
    }

    static passwordMatches(password, modelPassword) {
      return bcrypt.compare(password, modelPassword)
    }

    static sign(user, ProfessorId, StudentId) {
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          schemaname: user.InstitutionId ? user.Institution.schemaname : null,
          InstitutionId: user.InstitutionId,
          createdAt: user.createdAt,
          ProfessorId,
          StudentId,
          roleIds: user.User_Role_Institutions.filter(role => (role.InstitutionId === user.InstitutionId || !role.InstitutionId)).map(role => role.RoleId),
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

    static sideMenu(roles, permissions) {
      const menu = [];
      const perms = JSON.parse(JSON.stringify(permissions))
      
      if (roles.includes(1)) {
        menu.push({
          label: 'Mural Professor',
          url: '/mural/professor',
          external: false,
          icon: 'mdi-dots-square'
        })

        menu.push({
          label: 'Mural Alunos',
          url: '/mural/aluno',
          external: false,
          icon: 'mdi-dots-square'
        })

        menu.push({
          label: 'Usuários',
          url: '/usuarios',
          external: false,
          icon: 'mdi-account-box'
        })

        menu.push({
          label: 'Instituições',
          url: '/instituicoes',
          external: false,
          icon: 'mdi-school-outline'
        })

        menu.push({
          label: 'Indicadores',
          url: '/indicadores',
          external: false,
          icon: 'mdi-trending-up'
        })

        menu.push({
          label: 'Relatórios',
          url: '/relatorios',
          external: false,
          icon: 'mdi-file-chart'
        })

        menu.push({
          label: 'Materiais enviados',
          url: '/publicacao/aprovacao',
          external: false,
          icon: 'mdi-upload-multiple'
        })

        // menu.push({
        //   label: 'Tags de Questões',
        //   url: '/tags',
        //   external: false,
        //   icon: 'mdi-pound'
        // })
      }

      if (roles.includes(3)) {
        if (perms.find(perm => perm.PermissionId === 2)) {
          if (!menu.find(m => m.url === '/mural/professor')) {
            menu.push({
              label: 'Mural Professor',
              url: '/mural/professor',
              external: false,
              icon: 'mdi-dots-square'
            })
          }
  
          if (!menu.find(m => m.url === '/mural/aluno')) {
            menu.push({
              label: 'Mural Alunos',
              url: '/mural/aluno',
              external: false,
              icon: 'mdi-dots-square'
            })
          }  
        }

        if (perms.find(perm => perm.PermissionId === 1)) {
          menu.push({
            label: 'Banco de Questões',
            url: '/banco-de-questoes',
            external: false,
            icon: 'mdi-database-import-outline'
          })
        }

        if (perms.find(perm => perm.PermissionId === 1) && !menu.find(m => m.url === '/tags')) {
          menu.push({
            label: 'Banco de Conteúdos',
            url: '/tags',
            external: false,
            icon: 'mdi-pound'
          })
        }

        if (perms.find(perm => perm.PermissionId === 3) && !menu.find(m => m.url === '/planos-de-aula')) {
          menu.push({
            label: 'Planos de Aula',
            url: '/planos-de-aula',
            external: false,
            icon: 'mdi-google-classroom'
          })
        }

        if (perms.find(perm => perm.PermissionId === 4) && !menu.find(m => m.url === '/cursos-e-workshops')) {
          menu.push({
            label: 'Cursos e Workshops',
            url: '/cursos-e-workshops',
            external: false,
            icon: 'mdi-projector-screen-outline'
          })
        }

        if (perms.find(perm => perm.PermissionId === 5) && !menu.find(m => m.url === '/vestibulares/enem')) {
          menu.push({
            label: 'ENEM',
            url: '/vestibulares/enem',
            external: false,
            icon: 'mdi-pencil-circle-outline'
          })
        }

        if (perms.find(perm => perm.PermissionId === 6) && !menu.find(m => m.url === '/materiais-de-estudo')) {
          menu.push({
            label: 'Materiais de estudo',
            url: '/materiais-de-estudo',
            external: false,
            icon: 'mdi-cards-outline'
          })
        }
      }

      if (roles.includes(4)) {
        if (!menu.find(m => m.url === '/mural/professor')) {
          menu.push({
            label: 'Mural',
            url: '/mural/professor',
            external: false,
            icon: 'mdi-dots-square'
          })
        }

        menu.push({
          label: 'Minhas Turmas',
          url: '/turmas',
          external: false,
          icon: 'mdi-book-variant'
        })

        if (!menu.find(m => m.url === '/favoritos')) {
          menu.push({
            label: 'Itens importantes',
            url: '/favoritos',
            external: false,
            icon: 'mdi-star'
          })
        }

        menu.push({
          label: 'Banco de Atividades',
          url: '/banco-de-atividades',
          external: false,
          icon: 'mdi-database-check-outline'
        })

        if (!menu.find(m => m.url === '/planos-de-aula')) {
          menu.push({
            label: 'Planos de Aula',
            url: '/planos-de-aula',
            external: false,
            icon: 'mdi-google-classroom'
          })
        }

        menu.push({
          label: 'Pós Graduação',
          url: 'https://pos-graduacao.com.br',
          external: true,
          icon: 'mdi-link'
        })

        if (!menu.find(m => m.url === '/materiais-de-estudo')) {
          menu.push({
            label: 'Materiais de estudo',
            url: '/materiais-de-estudo',
            external: false,
            icon: 'mdi-cards-outline'
          })
        }

        if (!menu.find(m => m.url === '/cursos-e-workshops')) {
          menu.push({
            label: 'Cursos e Workshops',
            url: '/cursos-e-workshops',
            external: false,
            icon: 'mdi-projector-screen-outline'
          })
        }

        if (!menu.find(m => m.url === '/grupo-de-estudos')) {
          menu.push({
            label: 'Grupo de Estudos',
            url: '/grupo-de-estudos',
            external: false,
            icon: 'mdi-forum'
          })
        }

        menu.push({
          label: 'Chat Profissional',
          url: '/chat',
          external: false,
          icon: 'mdi-chat'
        })

        menu.push({
          label: 'Material para publicação',
          url: '/publicacao/professor',
          external: false,
          icon: 'mdi-upload-multiple'
        })
      }

      if (roles.includes(5)) {
        if (!menu.find(m => m.url === '/mural/aluno')) {
          menu.push({
            label: 'Mural',
            url: '/mural/aluno',
            external: false,
            icon: 'mdi-dots-square'
          })
        }

        menu.push({
          label: 'Minhas Turmas',
          url: '/turmas',
          external: false,
          icon: 'grid_view'
        })

        if (!menu.find(m => m.url === '/favoritos')) {
          menu.push({
            label: 'Itens importantes',
            url: '/favoritos',
            external: false,
            icon: 'mdi-star'
          })
        }

        if (!menu.find(m => m.url === '/cursos-e-workshops')) {
          menu.push({
            label: 'Cursos & Workshops',
            url: '/cursos-e-workshops',
            external: false,
            icon: 'mdi-projector-screen-outline'
          })
        }

        menu.push({
          label: 'ENEM',
          url: '/vestibulares/enem',
          external: false,
          icon: 'mdi-pencil-circle-outline'
        })
        
        if (!menu.find(m => m.url === '/materiais-de-estudo')) {
          menu.push({
            label: 'Materiais de estudo',
            url: '/materiais-de-estudo',
            external: false,
            icon: 'mdi-cards-outline'
          })
        }

        if (!menu.find(m => m.url === '/grupo-de-estudos')) {
          menu.push({
            label: 'Grupo de Estudos',
            url: '/grupo-de-estudos',
            external: false,
            icon: 'mdi-forum'
          })
        }
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
    key: {
      type: DataTypes.STRING,
      allowNull: true
    },
    confirmed: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false
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
    tour: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    connected: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    ip_connected: {
      type: DataTypes.STRING,
      allowNull: false
    },
    dtbirth: {
      type: DataTypes.STRING,
      allowNull: true
    },
    cpf: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true
    },
    rg: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true
    },
    profession: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};