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
        "role",
        "active"
      ],
    });

    if (!user) {
      throw new APIError("Este usuário não existe.");
    }

    if (user.confirmed === null) {
      throw new APIError("Conta de Usuário ainda não foi aceita pelo adminstrador.");
    }
    if (!user.confirmed) {
      throw new APIError("Conta de Usuário recusada pelo administrador.");
    }

    if (!user.active) {
      throw new APIError("Usuário inativo no sistema.");
    }

    if (!(await User.passwordMatches(password, user.password))) {
      throw new APIError("Os campos e-mail e/ou senha estão inválidos.");
    }

    const token = User.sign(user);

    // const menus = User.sideMenu(roles, user.User_Permissions);

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        photo: user.photo,
        confirmed: user.confirmed,
        createdAt: user.createdAt,
        role: user.role,
        birthday: user.birthday,
        cpf: user.cpf,
      },
      redirect: '/dashboard',
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
        "photo",
        "confirmed",
        "birthday",
        "cpf",
        "createdAt",
        "role",
        "active"
      ],
    });

    if (!foundUser) {
      throw new APIError("Este usuário não existe.");
    }

    if (!foundUser.active) {
      throw new APIError("Usuário inativado pelo sistema.");
    }

    const token = User.sign(foundUser);

    // const menus = User.sideMenu(roles, foundUser.User_Permissions);

    return res.json({
      token,
      user: {
        id: foundUser.id,
        name: foundUser.name,
        username: foundUser.username,
        email: foundUser.email,
        photo: foundUser.photo,
        confirmed: foundUser.confirmed,
        createdAt: foundUser.createdAt,
        role: foundUser.role,
        birthday: foundUser.birthday,
        cpf: foundUser.cpf,
      },
      redirect: '/dashboard',
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
