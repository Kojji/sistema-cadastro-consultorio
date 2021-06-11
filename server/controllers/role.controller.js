import httpStatus from 'http-status';
import db from '../models';
import APIError from '../helpers/APIError';

const { Role, sequelize } = db;

/**
 * Load role and append to req.
 */
const load = async (req, res, next, id) => {
  try {
    const role = await Role.findOne({ where: { id } })

    if (!role) {
      throw new APIError("Este cargo não existe.");
    }

    req.role = role; // eslint-disable-line no-param-reassign

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
 * Get role
 * @returns {Role}
 */
const get = async (req, res) => {
  const { role, user } = req;

  try {
    if (!user.roleIds.includes(1)) {
      throw new APIError("Não é possível visualizar um cargo diferente do seu.");
    }

    return res.json({
      data: role,
      success: true,
      message: ""
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
 * Create new role
 * @returns {Role}
 */
const create = async (req, res, next) => {
  const { title, description, active } = req.body;
  const { user } = req;

  const t = await sequelize.transaction();
  try {
    if (!user.roleIds.includes(1)) {
      throw new APIError("Você não tem permissão para criar cargos.");
    }

    const newRole = await Role.create({
      title,
      description,
      active
    }, { transaction: t });

    if (!newRole) {
      throw new APIError("Houve um erro ao criar o cargo.");
    }

    await t.commit();

    return res.json({
      success: true,
      message: 'Cargo criado com sucesso!'
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

/**
 * Update existing role
 * @returns {Role}
 */
const update = async (req, res, next) => {
  const { title, description } = req.body;
  const { role, user } = req;

  const u = await sequelize.transaction();
  try {
    if (!user.roleIds.includes(1)) {
      throw new APIError("Você não possui permissão para atualizar cargo.");
    }

    const updatedRole = await role.update({
      title,
      description
    }, { transaction: u });

    if (!updatedRole) {
      throw new APIError("Houve um erro ao atualizar o cargo.");
    }

    u.commit();

    return res.json({
      success: true,
      message: "Cargo atualizado com sucesso!"
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
 * Get role list.
 * @returns {Role[]}
 */
const list = async (req, res, next) => {
  const { limit = 20, page = 1, active = true } = req.query;
  const { roleId } = req.params;
  const offset = 0 + (parseInt(page) - 1) * limit;

  try {
    const roles = await Role.findAndCountAll({
      where: {
        active
      },
      attributes: ['id', 'title', 'description', 'active'],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    if (!roles) {
      throw new APIError("Não foi possível trazer a lista de cargos.");
    }

    return res.json({
      success: true,
      data: roles.rows,
      pagination: {
        limit,
        offset,
        page: parseInt(page),
        count: roles.count,
        nextPage: offset + limit <= roles.count
      }
    })
  } catch (err) {
    return res.status(err.status ? err.status : 500).json({
      success: false,
      message: err.message
    })
  }
}

// Não é possível remover cargos

export default {
  load,
  get,
  create,
  update,
  list
};
