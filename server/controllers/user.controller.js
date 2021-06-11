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
  Area,
  User_Area,
  Token_Control, 
  User_Role_Institution, 
  Institution, 
  Professor, 
  sequelize 
} = db;

/**
 * Load user and append to req.
 */
const load = async (req, res, next, id) => {
  try {
    const user = await User.findOne({ where: { id } })

    if (!user) {
      throw new APIError("Este usuário não existe.");
    }

    req.foundUser = user; // eslint-disable-line no-param-reassign

    return next();
  } catch (err) {
    return res.status(err.status ? err.status : 500).json({
      success: false,
      message: err.message,
      status: err.status ? err.status : 500
    })
  }
}

/**
 * Get user
 * @returns {User}
 */
const get = async (req, res) => {
  const { userId } = req.params;
  const { user } = req;

  try {
    if ((user.id != userId) && !user.roleIds.includes(1)) {
      throw new APIError("Não é possível visualizar um usuário diferente do seu.");
    }

    const userFound = await User.findOne({
      where: {
        id: userId
      },
      attributes: ['id', 'name', 'username', 'phone', 'email', 'active', 'confirmed', 'photo', 'profession', 'dtbirth', 'cpf', 'rg', 'InstitutionId'],
      include: [
        { 
          model: User_Area, 
          include: [
            { model: Area, attributes: ['id', 'title'] }
          ], attributes: ['id']
        },
        {
          model: User_Role_Institution,
          include: [
            {
              model: Institution,
              attributes: ['id', 'name', 'city', 'state', 'phone']
            }
          ]
        }
      ]
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
  const { user, body } = req;
  const { userId } = req.params;

  const u = await sequelize.transaction();
  try {
    if (userId != user.id) {
      throw new APIError("Você não possui permissão para atualizar usuário.");
    }

    const userFound = await User.findByPk(userId);

    const updatedUser = await userFound.update({
      name: body.name,
      phone: body.phone,
      profession: body.profession,
      dtbirth: body.dtbirth,
      cpf: body.cpf,
      rg: body.rg
    }, { transaction: u });

    if (!updatedUser) {
      throw new APIError("Houve um erro ao atualizar o usuário.");
    }

    u.commit();

    return res.json({
      success: true,
      message: "Usuário atualizado com sucesso!"
    });
  } catch (err) {
    u.rollback();
    return res.status(err.status ? err.status : 500).json({
      message: err.message,
      success: false,
      status: err.status ? err.status : 500
    });
  }
}

/**
 * Update password of existing user
 * @param {oldPassword, newPassword, repeatPassword, sure} req 
 * @param {object} res 
 * @returns {User}
 */
const changePassword = async (req, res) => {
  const { user } = req;
  const { oldPassword, newPassword, repeatPassword, sure } = req.body;
  const { userId } = req.params;

  const t = await sequelize.transaction();
  try {
    if (userId != user.id) {
      throw new APIError("Você não possui permissão para atualizar usuário.");
    }

    if (!sure) {
      throw new APIError("Para trocar a sua senha, é necessário confirmar a ação.");
    }

    if (newPassword !== repeatPassword) {
      throw new APIError("As novas senhas não coincidem.");
    }

    // const passwordHashed = User.passwordHash(oldPassword);

    const userFound = await User.findByPk(user.id);

    if (!userFound) {
      throw new APIError("Este usuário não existe.");
    }

    if (!(await User.passwordMatches(oldPassword, userFound.password))) {
      throw new APIError("A sua senha atual é inválida.");
    }

    const body = {
      password: await User.passwordHash(newPassword)
    }

    const updatedUser = await userFound.update(body, { transaction: t });

    if (!updatedUser) {
      throw new APIError("Houve um erro ao atualizar o usuário.");
    }

    await t.commit();

    return res.json({
      success: true,
      message: "Senha atualizada com sucesso!"
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
 * Get user list.
 * @returns {User[]}
 */
const list = async (req, res, next) => {
  const { limit = 20, page = 1, roleId = null } = req.query;
  const { user } = req;
  const offset = 0 + (parseInt(page) - 1) * limit;

  try {
    if (!user.roleIds.includes(1)) {
      throw new APIError("Não foi possível acessar este local.");
    }

    let ids = null

    if (!!roleId) {
      const User_Role_Institutions =  await User_Role_Institution.findAll({
        where: {
          RoleId: roleId
        },
        attributes: ['UserId'],
        raw: true
      })

      ids = User_Role_Institutions.map(role => role.UserId)
    }

    const users = await User.findAndCountAll({
      where: !!ids ? {
        id: ids
      } : null,
      include: [
        { 
          model: User_Area, 
          include: [
            { model: Area, attributes: ['id', 'title'] }
          ], attributes: ['id']
        },
      ],
      attributes: ['id', 'name', 'username', 'phone', 'email', 'active', 'confirmed', 'photo', 'profession', 'dtbirth', 'cpf', 'rg', 'createdAt'],
      order: [['createdAt', 'DESC']],
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

/**
 * Get user by name
 */
const fetchUser = async (req, res, next) => {
  const { user } = req;
  const { search } = req.query;

  try {
    if (!user.roleIds.includes(1)) {
      throw new APIError("Não foi possível acessar este local.");
    }

    let where = {}

    if (!!search) {
      where = {
        ...where,
        firstName: {
          [Op.iLike]: `%${search}`
        },
        lastName: {
          [Op.iLike]: `%${search}`
        }
      }
    }

    const users = await User.findAll({
      where,
      attributes: ['id', 'name', 'username', 'phone', 'email', 'active', 'confirmed', 'photo', 'profession', 'dtbirth', 'cpf', 'rg'],
      include: [
        { 
          model: User_Area, 
          include: [
            { model: Area, attributes: ['id', 'title'] }
          ], attributes: ['id']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    if (!users) {
      throw new APIError("Não foi possível trazer a lista de usuários.");
    }

    return res.json({
      success: true,
      users: users
    })

  } catch (err) {
    return res.status(err.status ? err.status : 500).json({
      success: false,
      message: err.message
    })
  }
}

/**
 * Account confirmation
 */
const confirmAccount = async (req, res, next) => {
  const { confirmed } = req.body;
  const { key } = req.params;

  const t = await sequelize.transaction();
  try {
    if (!confirmed) {
      throw new APIError("Sua conta não foi confirmada.");
    }

    if (!key) {
      throw new APIError("Não foi possível identificar a chave de confirmação.");
    }

    const userFound = await User.findOne({
      where: {
        key
      },
      attributes: ['id', 'key', 'confirmed']
    });

    if (!userFound) {
      throw new APIError("Não foi possível identificar o usuário.");
    }

    const userUpdated = await userFound.update({
      confirmed,
      key: null
    }, { transaction: t });

    if (!userUpdated) {
      throw new APIError("Não foi possível confirmar sua conta.");
    }

    await t.commit();

    return res.json({
      success: true,
      message: "Usuário confirmado com sucesso!"
    })
  } catch (err) {
    t.rollback();
    return res.status(err.status ? err.status : 500).json({
      message: err.message,
      success: false,
      status: err.status ? err.status : 500
    })
  }
}

const createUserImageUpload = async (req, res, next) => {
  const { file, user, foundUser } = req;
  const { userId } = req.params;

  const t = await sequelize.transaction();
  try {
    if (user.id != userId) {
      throw new APIError("Você não tem permissão para adicionar foto de usuário.", httpStatus.UNAUTHORIZED);
    }

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

    t.commit();

    return res.json({
      success: true,
      url_storage: updatedUser.photo,
      message: 'Imagem adicionada com sucesso!'
    })
  } catch (err) {
    t.rollback();

    return res.status(err.status ? err.status : 500).json({
      success: err.status ? err.status : 500,
      message: err.message,
      success: false
    })
  }
}

const updateInstitutionProfessor = async (req, res, next) => {
  const { userId, institutionId } = req.params;

  const t = await sequelize.transaction();
  const u = await sequelize.transaction();
  const p = await sequelize.transaction();
  try {
    if (req.user.id != userId) {
      throw new APIError("Você não tem permissão para acessar este local.");
    }

    if (!req.user.roleIds.includes(4)) {
      throw new APIError("Apenas professores podem acessar este local.");
    }

    if (institutionId == req.foundUser.InstitutionId) {
      throw new APIError("Erro ao atualizar instituição de ensino.");
    }

    const institutions = await Institution.findAndCountAll({
      where: {
        id: institutionId
      },
      attributes: ['id']
    })

    if (institutions.count === 0) {
      throw new APIError("Esta instituição de ensino não existe.");
    }

    const findUserRoleInstitution = await User_Role_Institution.findOne({
      where: {
        UserId: userId,
        RoleId: 4,
        InstitutionId: null
      }
    });

    if (!!findUserRoleInstitution) {
      const updatedUserRoleInstitution = await findUserRoleInstitution.update({
        InstitutionId: institutionId
      }, { transaction: t });

      if (!updatedUserRoleInstitution) {
        throw new APIError("Não foi possível atualizar a instituição do professor.");
      }
    } else {
      const createdUserRoleInstitution = await User_Role_Institution.create({
        UserId: userId,
        RoleId: 4,
        InstitutionId: institutionId
      }, { transaction: t });

      if (!createdUserRoleInstitution) {
        throw new APIError("Não foi possível criar a instituição do professor.");
      }
    }

    const updatedUser = await req.foundUser.update({
      InstitutionId: institutionId
    }, { transaction: u });

    if (!updatedUser) {
      throw new APIError("Não foi possível atualizar a instituição do usuário.");
    }

    const getInstitution = await Institution.findOne({ where: { id: institutionId }, attributes: ['schemaname'] })

    const updateProfessor = await Professor.schema(getInstitution.schemaname).create({
      UserId: userId,
      active: true,
      institution_email: '',
      institution_phone: ''
    }, { transaction: p })

    if (!updateProfessor) {
      throw new APIError("Não foi possível criar o professor à escola.");
    }

    await t.commit();
    await u.commit();
    await p.commit();

    return res.json({ data: [], success: true, message: "Instituição de ensino adicionada com sucesso!" });
  } catch (err) {
    await t.rollback();
    await u.rollback();
    await p.rollback();
    return res.status(err.status ? err.status : 500).json({
      success: false,
      message: err.message
    })
  }
}

const sendEmailActivation = async (req, res, next) => {
  const { user } = req
  const { userId } = req.params
  const { type } = req.body

  const t = await sequelize.transaction()
  try {
    if (!user.roleIds.includes(1)) {
      throw new APIError("Você não tem permissão para criar usuários.");
    }

    const foundUser = await User.findOne({
      where: {
        id: userId
      },
      include: [
        {
          model: User_Role_Institution
        }
      ]
    });

    if (!foundUser) {
      throw new APIError("Usuário não encontrado.");
    }

    const key = crypto.MD5(foundUser.email + new Date());

    const updatedUser = await foundUser.update({
      key: key.toString(),
      confirmed: false
    }, { transaction: t })

    if (!updatedUser) {
      throw new APIError("Houve um erro ao criar a nova chave de ativação do usuário.")
    }

    t.commit()

    if (type === 'reset-password') {
      if (!(await EmailProvider.sendPasswordReset(updatedUser))) {
        throw new APIError("Houve um erro ao processar o envio de e-mail.");
      }  
    }

    if (type === 'activate-account') {
      const types = [
        'sendUserConfirmation',
        'sendPasswordReset'
      ]

      const role = foundUser.User_Role_Institutions.find(role => role.RoleId === 5)

      let type = 0
      if (!!role) type = 1

      if (!(await EmailProvider[types[type]](updatedUser))) {
        throw new APIError("Houve um erro ao processar o envio de e-mail.");
      }
    }

    return res.json({
      success: true,
      message: `E-mail para ${foundUser.name} enviado com sucesso! Aguarde alguns minutos para enviar novamente caso necessário.`
    })
  } catch (err) {
    await t.rollback();
    return res.status(err.status ? err.status : 500).json({
      message: err.message,
      success: false,
      status: err.status ? err.status : 500
    });
  }
}

const activateUser = async (req, res, next) => {
  const { userId } = req.params
  const { user } = req

  const t = await sequelize.transaction()
  try {
    if (!user.roleIds.includes(1)) {
      throw new APIError("Você não tem permissão para criar usuários.");
    }

    const foundUser = await User.findOne({
      where: {
        id: userId
      }
    });

    if (!foundUser) {
      throw new APIError("Usuário não encontrado.");
    }

    const updatedUser = await foundUser.update({
      active: !foundUser.active
    }, { transaction: t })

    if (!updatedUser) {
      throw new APIError("Houve um erro ao atualizar o usuário.")
    }

    t.commit()

    return res.json({
      success: true,
      message: `Usuário ${foundUser.name} ${!foundUser.active ? ' Inativado' : ' Ativado'} com sucesso!`
    })
  } catch (err) {
    await t.rollback();
    return res.status(err.status ? err.status : 500).json({
      message: err.message,
      success: false,
      status: err.status ? err.status : 500
    });
  }
}

const updateStatus = async (req, res, next) => {
  const { status, token } = req.body
  try {
    const getTokenControl = await Token_Control.findOne({
        where: { token },
        attributes: ['id']
    })
    if(getTokenControl) {
      getTokenControl.update({
        active: status
      })
    }
    return res.json({
      success: true
    })
  } catch (err) {
    return res.status(err.status ? err.status : 500).json({
      message: err.message,
      success: false,
      status: err.status ? err.status : 500
    });
  }
}

const insertAreatoUser = async (req, res, next) => {
  const { user } = req;
  const { areaId } = req.params;
  const t = await sequelize.transaction();
  try {
    const foundUserArea = await User_Area.findOne({
      where: {
        UserId: user.id,
        AreaId: areaId
      }
    })
    if(foundUserArea)
      throw new APIError("A area já está associada a este usuário.")

    const createUserArea = await User_Area.create({
      UserId: user.id,
      AreaId: areaId
    }, {transaction: t})
    if(!createUserArea)
      throw new APIError("Houve um erro ao tentar associar a area ao usuário.")

    await t.commit();
    return res.json({
      success: true,
      message: "Sucesso ao associar area ao usuário!"
    })
  } catch (err) {
    await t.rollback();
    return res.status(err.status ? err.status : 500).json({
      message: err.message,
      success: false,
      status: err.status ? err.status : 500
    });
  }
}

const removeAreafromUser = async (req, res, next) => {
  const { user } = req;
  const { areaId } = req.params;
  const d = await sequelize.transaction();
  try {
    const foundUserArea = await User_Area.findOne({
      where: {
        UserId: user.id,
        AreaId: areaId
      }
    })
    if(!foundUserArea)
      throw new APIError("Não foi encontrado associação desta area com o usuário.")

    const deleteUserArea = await foundUserArea.destroy({transaction: d})
    if(!deleteUserArea)
      throw new APIError("Houve um erro ao tentar remover a associação da area ao usuário.")

    await d.commit();
    return res.json({
      success: true,
      message: "Sucesso ao remover area do usuário!"
    })
  } catch (err) {
    await d.rollback();
    return res.status(err.status ? err.status : 500).json({
      message: err.message,
      success: false,
      status: err.status ? err.status : 500
    });
  }
}

const getUserAreas = async (req, res, next) => {
  const { user } = req;
  try {
    const foundUserAreas = await User_Area.findAll({
      where: {
        UserId: user.id,
      },
      attributes: ['id', 'AreaId'],
      include: [{
        model: Area,
        attributes: ['id', 'title']
      }]
    })
    if(!foundUserAreas)
      throw new APIError("Não foi encontrado associação desta area com o usuário.")

    return res.json({
      success: true,
      data: foundUserAreas.map(element => {
        return {AreaId: element.Area.id, title: element.Area.title }
      })
    })
  } catch (err) {
    return res.status(err.status ? err.status : 500).json({
      message: err.message,
      success: false,
      status: err.status ? err.status : 500
    });
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


  load, 
  get, 
  update, 
  list, 
  changePassword, 
  confirmAccount, 
  createUserImageUpload, 
  fetchUser, 
  updateInstitutionProfessor, 
  sendEmailActivation, 
  activateUser, 
  updateStatus,
  insertAreatoUser,
  removeAreafromUser,
  getUserAreas
};
