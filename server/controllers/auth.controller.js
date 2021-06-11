import APIError from '../helpers/APIError';
import crypto from "crypto-js";
import EmailProvider from "../services/emails/email.provider";
import db from '../models';
import { Op } from 'sequelize';
import httpStatus from 'http-status';

const {
  User,
  Token_Control,
  User_Area,
  Institution,
  User_Role_Institution,
  Role,
  Professor,
  Student,
  Area,
  User_Permission,
  sequelize
} = db;

/**
 * Returns jwt token if valid username and password is provided
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
const login = async (req, res, next) => {
  const { username, password } = req.body;
  const where = {
    [Op.or]: {
      email: username,
      username
    }
  };

  try {
    const user = await User.findOne({
      where,
      attributes: [
        "id",
        "name",
        "username",
        "email",
        "photo",
        "confirmed",
        "password",
        "birthday",
        "cpf",
        "createdAt",
        "updatedAt",
        "role",
        "active"
      ],
    });

    if (!user) {
      throw new APIError("Este usuário não existe.");
    }

    if (!user.active) {
      throw new APIError("Usuário inativo no sistema.");
    }

    if (!(await User.passwordMatches(password, user.password))) {
      throw new APIError("Os campos e-mail e/ou senha estão inválidos.");
    }

    const token = User.sign(user);

    // const menus = User.sideMenu(roles, user.User_Permissions);
    // let redirect = '/mural/professor'

    // if (roles.includes(5)) {
    //   redirect = '/mural/aluno'
    // }

    // const getTokenControl = await Token_Control.findOne({
    //   where: { UserId: user.id },
    //   attributes: ['id', 'active']
    // })
    // if(!getTokenControl) {
    //   await Token_Control.create({
    //     UserId: user.id,
    //     ip: '',
    //     active: true,
    //     token
    //   })
    // } else {
    //   await getTokenControl.update({
    //     active: true,
    //     token
    //   })
    // }

    return res.json({
      token,
      data: user,
      // user: {
      //   id: user.id,
      //   name: user.name,
      //   username: user.username,
      //   email: user.email,
      //   phone: user.phone,
      //   photo: user.photo,
      //   confirmed: user.confirmed,
      //   createdAt: user.createdAt,
      //   updatedAt: user.updatedAt,
      //   profession: user.profession,
      //   Areas: user.User_Areas.map((element) => {
      //     return {AreaId: element.Area.id, title: element.Area.title }
      //   }),
      //   dtbirth: user.dtbirth,
      //   cpf: user.cpf,
      //   rg: user.rg,
      //   roles: rolesObj,
      //   InstitutionId: roles.includes(4) ? user.InstitutionId : undefined,
      // },
      // rows: menus,
      // redirect,
      success: true
    })

  } catch (err) {
    return res.status(err.status ? err.status : 500).json({
      message: err.message,
      success: false,
      status: err.status ? err.status : 500,
      redirect: '/login'
    });
  }
}

const token = async (req, res, next) => {
  const { user } = req;

  try {
    const foundUser = await User.findOne({
      where: { id: user.id },
      attributes: [
        "id",
        "name",
        "username",
        "email",
        "phone",
        "photo",
        "confirmed",
        "password",
        "profession",
        "InstitutionId",
        "dtbirth",
        "cpf",
        "rg",
        "createdAt",
        "updatedAt",
        "active"
      ],
      include: [
        { model: Institution, attributes: ['id', 'schemaname', 'name', 'photo', 'cep', 'city', 'state', 'district', 'address', 'number', 'complement', 'phone', 'timezone'] },
        { model: User_Role_Institution, attributes: ['UserId', 'RoleId'], include: [{ model: Role }] },
        { 
          model: User_Area, 
          include: [
            { model: Area, attributes: ['id', 'title'] }
          ], attributes: ['id']
        },
        {
          model: User_Permission,
          attributes: ['PermissionId']
        }
      ]
    });

    if (!foundUser) {
      throw new APIError("Este usuário não existe.");
    }

    if (!foundUser.active) {
      throw new APIError("Usuário inativado pelo sistema.");
    }

    let get_isStudent = null;
    let get_isProfessor = null;
    if(foundUser.InstitutionId) {
      get_isStudent = await Student.schema(foundUser.Institution.schemaname).findOne({ where: { UserId: foundUser.id }, attributes: ['id', 'GradeId', 'LevelId', 'active'] })
      get_isProfessor = await Professor.schema(foundUser.Institution.schemaname).findOne({ where: { UserId: foundUser.id }, attributes: ['id', 'institution_email', 'institution_phone'] })
    }
    
    const token = User.sign(foundUser, get_isProfessor? get_isProfessor.id : null, get_isStudent? get_isStudent.id : null);

    const getRoles = await User_Role_Institution.findAll({
      where: {
        InstitutionId: foundUser.InstitutionId,
        UserId: foundUser.id
      },
      attributes: ['UserId', 'RoleId'],
      include: [{ model: Role }]
    });

    let roles = null;
    let rolesObj = null;

    if (!!getRoles) {
      roles = getRoles.map(role => role.RoleId);
      rolesObj = getRoles.map(role => ({
        id: role.RoleId,
        title: role.Role.title
      }));
    } else {
      roles = foundUser.User_Role_Institutions.map(role => role.RoleId);
      rolesObj = foundUser.User_Role_Institutions.map(role => ({
        id: role.RoleId,
        title: role.Role.title
      }));
    }

    const menus = User.sideMenu(roles, foundUser.User_Permissions);
    let redirect = '/mural/professor'

    let getProfessor = null
    if (roles.includes(4) && foundUser.InstitutionId) {
      getProfessor = await Professor.schema(foundUser.Institution.schemaname).findOne({ where: { UserId: foundUser.id }, attributes: ['id', 'institution_email', 'institution_phone'] })
    }

    let getStudent = null
    if (roles.includes(5) && foundUser.InstitutionId) {
      getStudent = await Student.schema(foundUser.Institution.schemaname).findOne({ where: { UserId: foundUser.id }, attributes: ['id', 'GradeId', 'LevelId', 'active'] })
      redirect = '/mural/aluno'
    }

    const getTokenControl = await Token_Control.findOne({
      where: { UserId: user.id },
      attributes: ['id']
    })
    if(!getTokenControl) {
      throw new APIError("Token de acesso precisa ser renovado.");
    } else {
      await getTokenControl.update({
        token,
        active: true
      })
    }

    return res.json({
      token,
      user: {
        id: foundUser.id,
        name: foundUser.name,
        username: foundUser.username,
        email: foundUser.email,
        phone: foundUser.phone,
        photo: foundUser.photo,
        confirmed: foundUser.confirmed,
        createdAt: foundUser.createdAt,
        updatedAt: foundUser.updatedAt,
        profession: foundUser.profession,
        dtbirth: foundUser.dtbirth,
        cpf: foundUser.cpf,
        rg: foundUser.rg,
        User_Permissions: foundUser.User_Permissions,
        Areas: foundUser.User_Areas.map((element) => {
          return {AreaId: element.Area.id, title: element.Area.title }
        }),
        Institution: foundUser.InstitutionId ? {
          id: foundUser.Institution.id,
          name: foundUser.Institution.name,
          photo: foundUser.Institution.photo,
          cep: foundUser.Institution.cep,
          city: foundUser.Institution.city,
          state: foundUser.Institution.state,
          district: foundUser.Institution.district,
          address: foundUser.Institution.address,
          number: foundUser.Institution.number,
          complement: foundUser.Institution.complement,
          phone: foundUser.Institution.phone,
          timezone: foundUser.Institution.timezone,
          professor: getProfessor,
          student: getStudent
        } : null,
        roles: rolesObj,
        InstitutionId: roles.includes(4) || roles.includes(5) ? foundUser.InstitutionId : undefined
      },
      rows: menus,
      redirect,
      success: true
    })

  } catch (err) {
    return res.status(err.status ? err.status : 500).json({
      message: err.message,
      success: false,
      status: err.status ? err.status : 500,
      redirect: '/login'
    });
  }
}

const askResetPassword = async (req, res, next) => {
  const { username } = req.body;
  const where = {
    [Op.or]: {
      email: username,
      username
    }
  };

  const t = await sequelize.transaction();
  try {
    const user = await User.findOne({ where });

    if (!user) {
      throw new APIError("Usuário não encontrado ou inexistente.");
    }

    const hash = crypto.MD5(user.email + new Date());

    const updatedUser = await user.update({
      key: hash.toString()
    }, { transaction: t });

    if (!updatedUser) {
      throw new APIError("Houve um erro ao processar a solicitação.");
    }

    if (!(await EmailProvider.sendPasswordReset(user))) {
      throw new APIError("Houve um erro ao processar o envio de e-mail.");
    }

    await t.commit();

    return res.json({
      success: true,
      message: "Em alguns instantes você receberá instruções em seu e-mail para finalizar a troca de sua senha!"
    });
  } catch (err) {
    await t.rollback();
    return res.status(err.status).json({
      message: err.message,
      success: false,
      status: err.status
    });
  }
}

const resetPassword = async (req, res, next) => {
  const { key } = req.params;

  try {
    if (!key) {
      throw new APIError("Chave inválida.");
    }
    const where = { key }

    const user = await User.findOne({
      where,
      attributes: [
        "id",
        "name",
        "username",
        "email",
        "photo",
        "confirmed"
      ],
    });

    if (!user) {
      throw new APIError("Chave inválida.");
    }

    return res.json({
      user,
      success: true,
      message: "Usuário encontrado, redefina sua senha!"
    });
  } catch (err) {
    return res.status(err.status).json({
      message: err.message,
      success: false,
      status: err.status
    });
  }
}

const postResetPassword = async (req, res, next) => {
  const { password, repeatPassword, UserId, key } = req.body;

  const t = await sequelize.transaction();
  try {
    if (password !== repeatPassword) {
      throw new APIError("As senhas não coincidem. Tente novamente.", httpStatus.UNAUTHORIZED);
    }

    const user = await User.findOne({ where: { id: UserId, key } });

    const hash = await User.passwordHash(password);

    const updatedUser = await user.update({
      password: hash,
      key: null,
      confirmed: true
    }, { transaction: t });

    if (!updatedUser) {
      throw new APIError("Houve algum erro durante a troca de senha.");
    }

    await t.commit();

    return res.json({
      success: true,
      message: "Senha atualizada com sucesso!",
    });
  } catch (err) {
    await t.rollback();
    return res.status(err.status).json({
      success: false,
      message: err.message,
      status: err.status
    })
  }
}

export default { login, askResetPassword, resetPassword, postResetPassword, token };
