import APIError from '../helpers/APIError';
import db from '../models';
import { Op } from 'sequelize';

const {
  User
} = db;

// Login into app
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

    const menus = User.sideMenu(user.role);

    return res.json({
      token,
      menus,
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
      redirect: '/fichas',
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

// Update access token
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

    const menus = User.sideMenu(user.role);

    return res.json({
      token,
      menus,
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
      redirect: '/fichas',
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

export default { login, token };
