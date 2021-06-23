import httpStatus from 'http-status';
import crypto from "crypto-js";
import db from '../models';
import APIError from '../helpers/APIError';
import replaceSpecialChars from "../helpers/textNormalize";
import EmailProvider from "../services/emails/email.provider";
// import fs from 'fs';
import path from 'path';
import fs from 'fs-extra';
import { writeFile } from 'fs';
import { Op } from 'sequelize';

const { User,
  sequelize 
} = db;

/**
 * Get user
 * @returns {User}
 */
const get = async (req, res) => {
  const { userId } = req.params;
  const { user } = req;

  try {
    if ((user.id != userId) && user.role !== 1) {
      throw new APIError("Não é possível visualizar um usuário diferente do seu.");
    }

    const userFound = await User.findOne({
      where: {
        id: userId
      },
      attributes: {
        exclude: ['password', 'updatedAt']
      },
    })

    if (!userFound) {
      throw new APIError("Usuário não encontrado.");
    }
    return res.json({
      user: userFound,
      success: true
    });
  } catch (err) {
    return res.status(err.status ? err.status : 500).json({
      message: err.message,
      success: false,
      status: err.status ? err.status : 500
    });
  }
}
/**
 * Register new user
 * @returns {User}
 */
const register = async (req, res, next) => {
  const { name, email, username, birthday, cpf, password } = req.body;
  const t = await sequelize.transaction();
  try {
    const foundUser = await User.findOne({
      where: {
        [Op.or]: {
          cpf,
          email,
          username
        }
      }, attributes: ['id', 'cpf', 'email', 'username']
    })
    if(foundUser) {
      if(foundUser.cpf === cpf)
        throw new APIError("Um cadastro já foi realizado com este cpf.");
      if(foundUser.email === email)
        throw new APIError("Um cadastro já foi realizado com este endereço de e-mail.");
      if(foundUser.username === username)
        throw new APIError("Este login já está sendo utilizado.");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(email)) {
      throw new APIError("Endereço de E-mail inválido.");
    }

    const hash = await User.passwordHash(password);
    
    const createdUser = await User.create({
      cpf,
      name,
      email,
      username,
      birthday,
      password: hash,
      role: 0,
      photo: null,
      confirmed: null,
      active: false
    }, {transaction: t})

    if(!createdUser)
      throw new APIError("Houve um erro ao criar seu pedido de cadastro.");

    await t.commit();
    return res.json({
      message: "Seu cadastro foi enviado para aprovação com sucesso!",
      success: true
    });
  } catch (err) {
    await t.rollback();
    return res.status(err.status ? err.status : 500).json({
      message: err.message,
      success: false,
      status: err.status ? err.status : 500
    });
  }
}

/**
 * Create new user
 * @returns {User}
 */
const create = async (req, res, next) => {
  const { name, email, username, birthday, cpf, password='1234ab', role=2 } = req.body;
  const { user } = req;

  const t = await sequelize.transaction();
  try {
    if (user.role !== 1) {
      throw new APIError("Você não tem permissão para criar usuários.");
    }

    const foundUser = await User.findOne({
      where: {
        [Op.or]: {
          cpf,
          email,
          username
        }
      }, attributes: ['id', 'cpf', 'email', 'username']
    })
    if(foundUser) {
      if(foundUser.cpf === cpf)
        throw new APIError("Um cadastro já foi realizado com este cpf.");
      if(foundUser.email === email)
        throw new APIError("Um cadastro já foi realizado com este endereço de e-mail.");
      if(foundUser.username === username)
        throw new APIError("Este login já está sendo utilizado.");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(email)) {
      throw new APIError("Endereço de E-mail inválido.");
    }

    const hash = await User.passwordHash(password);
    
    const createdUser = await User.create({
      cpf,
      name,
      email,
      username,
      birthday,
      password: hash,
      role,
      photo: null,
      confirmed: true,
      active: true
    }, {transaction: t})

    if(!createdUser)
      throw new APIError("Houve um erro ao cadastrar usuário.");

    await t.commit();
    return res.json({
      message: "Usuário cadastrado com senha padrão '1234ab'!",
      success: true
    });
  } catch (err) {
    await t.rollback();
    return res.status(err.status ? err.status : 500).json({
      message: err.message,
      success: false,
      status: err.status ? err.status : 500
    });
  }
}

/**
 * Update existing user
 * @returns {User}
 */
const update = async (req, res, next) => {
  const { name, birthday, cpf } = req.body;
  const { user } = req;
  const { userId } = req.params;

  const u = await sequelize.transaction();
  try {
    if (userId != user.id) {
      throw new APIError("Você não possui permissão para atualizar usuário.");
    }

    const userFound = await User.findByPk(userId);

    const foundUsername = await User.findOne({
      where: {
        cpf,
        id:{[Op.not]: user.id}
      },
      attributes: ['id', 'cpf']
    })
    if(foundUsername) {
      throw new APIError("Este cpf já está em uso.");
    }

    const updatedUser = await userFound.update({
      name,
      cpf,
      birthday
    }, { transaction: u });

    if (!updatedUser) {
      throw new APIError("Houve um erro ao atualizar o usuário.");
    }

    await u.commit();

    return res.json({
      success: true,
      message: "Usuário atualizado com sucesso!"
    });
  } catch (err) {
    await u.rollback();
    return res.status(err.status ? err.status : 500).json({
      message: err.message,
      success: false,
      status: err.status ? err.status : 500
    });
  }
}

/**
 * Update existing user
 * @returns {User}
 */
const updateByAdmin = async (req, res, next) => {
  const { name, username, birthday, email, cpf, role=2, confirmed, active=true } = req.body;
  const { user } = req;
  const { userId } = req.params;

  const u = await sequelize.transaction();
  try {
    if (user.role !== 1) {
      throw new APIError("Você não possui permissão para atualizar cadastros de usuários.");
    }

    const userFound = await User.findByPk(userId);

    const foundUsername = await User.findOne({
      where: {
        [Op.or]: {
          email,
          username,
          cpf
        },
        id:{[Op.not]: userId}
      },
      attributes: ['id', 'username', 'email']
    })
    if(foundUsername) {
      if(foundUsername.cpf === cpf)
        throw new APIError("Este cpf já está em uso.");
      if(foundUsername.email === email)
        throw new APIError("Este endereço de e-mail já está em uso.");
      if(foundUsername.username === username)
        throw new APIError("Este login já está em uso.");
    }

    const updatedUser = await userFound.update({
      name, 
      username, 
      birthday, 
      email, 
      cpf, 
      role, 
      confirmed, 
      active
    }, { transaction: u });

    if (!updatedUser) {
      throw new APIError("Houve um erro ao atualizar o usuário.");
    }

    await u.commit();

    return res.json({
      success: true,
      message: "Usuário atualizado com sucesso!"
    });
  } catch (err) {
    await u.rollback();
    return res.status(err.status ? err.status : 500).json({
      message: err.message,
      success: false,
      status: err.status ? err.status : 500
    });
  }
}

const resetPassword = async (req, res, next) => {
  const { user } = req;
  const { userId } = req.params;

  const u = await sequelize.transaction();
  try {
    if (user.role !== 1) {
      throw new APIError("Você não possui permissão para realizar esta operação.");
    }

    const userFound = await User.findByPk(userId);

    const hash = await User.passwordHash('1234ab');

    const updatedUser = await userFound.update({
      password: hash
    }, { transaction: u });

    if (!updatedUser) {
      throw new APIError("Houve um erro ao atualizar o usuário.");
    }

    await u.commit();

    return res.json({
      success: true,
      message: "Senha retornada ao padrão '1234ab' com sucesso!"
    });
  } catch (err) {
    await u.rollback();
    return res.status(err.status ? err.status : 500).json({
      message: err.message,
      success: false,
      status: err.status ? err.status : 500
    });
  }
}

const changePassword = async (req, res, next) => {
  const { oldPassword, password } = req.body;
  const { user } = req;

  const u = await sequelize.transaction();
  try {

    const hash = await User.passwordHash(password);
    const userFound = await User.findOne({
      where: {
        id: user.id,
      }, attributes: ['id', 'password']
    });

    if (!(await User.passwordMatches(oldPassword, userFound.password))) {
      throw new APIError("Senha atual informada é inválida.");
    }

    const updatedUser = await userFound.update({
      password: hash
    }, { transaction: u });
    if(!updatedUser)
      throw new APIError("Houve um erro ao tentar atualizar sua senha.");

    await u.commit();

    return res.json({
      success: true,
      message: "Senha atualizado com sucesso!"
    });
  } catch (err) {
    await u.rollback();
    return res.status(err.status ? err.status : 500).json({
      message: err.message,
      success: false,
      status: err.status ? err.status : 500
    });
  }
}

const changeEmailUsername = async (req, res, next) => {
  const { oldPassword, email=null, username=null } = req.body;
  const { user } = req;

  const u = await sequelize.transaction();
  try {
    const userFound = await User.findOne({
      where: {
        id: user.id,
      }, attributes: ['id', 'password']
    });

    if (!(await User.passwordMatches(oldPassword, userFound.password))) {
      throw new APIError("Senha atual informada é inválida.");
    }

    const foundUsername = await User.findOne({
      where: {
        [Op.or]: {
          email,
          username
        },
        id:{[Op.not]: user.id}
      },
      attributes: ['id', 'username', 'email']
    })
    if(foundUsername) {
      if(foundUsername.email === email)
        throw new APIError("Este endereço de e-mail já está em uso.");
      if(foundUsername.username === username)
        throw new APIError("Este login já está em uso.");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(email)) {
      throw new APIError("Endereço de E-mail inválido.");
    }

    const updatedUser = await userFound.update({
      email,
      username
    }, { transaction: u });
    if(!updatedUser)
      throw new APIError("Houve um erro ao tentar atualizar sua senha.");

    await u.commit();

    return res.json({
      success: true,
      message: "informações de acesso atualizadas com sucesso!"
    });
  } catch (err) {
    await u.rollback();
    return res.status(err.status ? err.status : 500).json({
      message: err.message,
      success: false,
      status: err.status ? err.status : 500
    });
  }
}

/**
 * Get user list.
 * @returns {User[]}
 */
const list = async (req, res, next) => {
  const { limit = 20, page = 1, confirmed=null } = req.query;
  const { user } = req;
  const offset = 0 + (parseInt(page) - 1) * limit;

  try {
    if ( user.role !==1 ) {
      throw new APIError("Não foi possível acessar este local.");
    }

    const users = await User.findAndCountAll({
      where: {
        confirmed
      },
      attributes: {
        exclude: ['updatedAt', 'password']
      },
      order: [['createdAt', 'ASC']],
      limit,
      offset
    });

    if (!users) {
      throw new APIError("Não foi possível trazer a lista de usuários.");
    }

    return res.json({
      success: true,
      users: users.rows,
      pagination: {
        limit,
        offset,
        page: parseInt(page),
        count: users.count,
        nextPage: offset + limit <= users.count
      }
    })
  } catch (err) {
    return res.status(err.status ? err.status : 500).json({
      success: false,
      message: err.message
    })
  }
}

const createUserImageUpload = async (req, res, next) => {
  const { file, user } = req;

  const t = await sequelize.transaction();
  try {

    const foundUser = await User.findByPk(user.id);

    const filename = Date.now() + '_' + replaceSpecialChars(path.basename(file.originalname)) + path.extname(file.originalname);
    const filePath = 'static/files/users/' + filename

    fs.ensureDir((process.env.NODE_ENV === 'production' ? '/var/www/api.teachlearn.com.br/' : '') + path.dirname(filePath), { mode: 0o2775 }, (err) => {
      if (err) throw new APIError("Erro ao gerar pastas para salvar arquivo.");
      writeFile((process.env.NODE_ENV === 'production' ? '/var/www/api.teachlearn.com.br/' : '') + filePath, file.buffer, (err) => {
        if (err) {
          throw new APIError("Erro ao gravar arquivo.");
        }
      })
    });

    const updatedUser = await foundUser.update({
      photo: (process.env.NODE_ENV === 'production' ? 'https' : req.protocol) + '://' + req.get('host') + '/' + filePath
    }, { transaction: t });

    if (!updatedUser) {
      throw new APIError("Houve um erro ao atualizar a foto do usuário.");
    }

    await t.commit();

    return res.json({
      success: true,
      url_storage: updatedUser.photo,
      message: 'Imagem adicionada com sucesso!'
    })
  } catch (err) {
    await t.rollback();

    return res.status(err.status ? err.status : 500).json({
      success: err.status ? err.status : 500,
      message: err.message,
      success: false
    })
  }
}

/**
 * Delete user.
 * 
 * It is not possible to delete any user under any circumstances.
 */

export default {
  register,
  create, 
  get,
  update,
  updateByAdmin, 
  resetPassword,
  changePassword, 
  changeEmailUsername,
  list,
  createUserImageUpload, 
};
