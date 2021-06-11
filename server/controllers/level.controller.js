import httpStatus from 'http-status';
import db from '../models';
import APIError from '../helpers/APIError';

const { Level, sequelize } = db;

/**
 * Load level and append to req.
 */
const load = async (req, res, next, id) => {
  try {
    const level = await Level.findOne({ where: { id } })

    if (!level) {
      throw new APIError("Este nível não existe.");
    }

    req.level = level; // eslint-disable-line no-param-reassign

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
 * Get level
 * @returns {Level}
 */
const get = async (req, res) => {
  const { level, user } = req;

  try {
    if (!user.roleIds.includes(1)) {
      throw new APIError("Não é possível visualizar um nível diferente do seu.");
    }

    return res.json({
      data: level,
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
 * Create new level
 * @returns {Level}
 */
const create = async (req, res, next) => {
  const { title, description, active } = req.body;
  const { user } = req;

  const t = await sequelize.transaction();
  try {
    if (!user.roleIds.includes(1)) {
      throw new APIError("Você não tem permissão para criar nívels.");
    }

    const newLevel = await Level.create({
      title,
      description,
      active
    }, { transaction: t });

    if (!newLevel) {
      throw new APIError("Houve um erro ao criar o nível.");
    }

    await t.commit();

    return res.json({
      success: true,
      message: 'Nível criado com sucesso!'
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
 * Update existing level
 * @returns {Level}
 */
const update = async (req, res, next) => {
  const { title, description, active } = req.body;
  const { level, user } = req;

  const u = await sequelize.transaction();
  try {
    if (!user.roleIds.includes(1)) {
      throw new APIError("Você não possui permissão para atualizar nível.");
    }

    const updatedLevel = await level.update({
      title,
      description,
      active
    }, { transaction: u });

    if (!updatedLevel) {
      throw new APIError("Houve um erro ao atualizar o nível.");
    }

    u.commit();

    return res.json({
      success: true,
      message: "Nível atualizado com sucesso!"
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
 * Get level list.
 * @returns {Level[]}
 */
const list = async (req, res, next) => {
  const { limit = 20, page = 1, active = true } = req.query;
  const offset = 0 + (parseInt(page) - 1) * limit;

  try {
    const levels = await Level.findAndCountAll({
      where: {
        active
      },
      attributes: ['id', 'title', 'description', 'active'],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    if (!levels) {
      throw new APIError("Não foi possível trazer a lista de nívels.");
    }

    return res.json({
      success: true,
      data: levels.rows,
      pagination: {
        limit,
        offset,
        page: parseInt(page),
        count: levels.count,
        nextPage: offset + limit <= levels.count
      }
    })
  } catch (err) {
    return res.status(err.status ? err.status : 500).json({
      success: false,
      message: err.message
    })
  }
}

const remove = async (req, res, next) => {
  const { user, level } = req;

  const t = await sequelize.transaction();
  try {
    if (!user.roleIds.includes(1)) {
      throw new APIError("Você não possui permissão para excluir este nível.");
    }

    const deletedLevel = await level.destroy({ transaction: t });

    if (!deletedLevel) {
      throw new APIError("Houve um erro ao excluir o nível.");
    }

    t.commit();

    return res.json({
      success: true,
      message: "Nível excluído com sucesso!"
    });
  } catch (err) {
    r.rollback();
    return res.status(err.status ? err.status : 500).json({
      success: false,
      message: err.message,
      status: err.status ? err.status : 500
    })
  }
}

export default {
  load,
  get,
  create,
  update,
  list,
  remove
};
