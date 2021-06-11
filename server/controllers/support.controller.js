import httpStatus from 'http-status';
import db from '../models';
import APIError from '../helpers/APIError';
import { Op } from 'sequelize';

const { Support, sequelize } = db;

/**
 * Load support and append to req.
 */
const load = async (req, res, next, id) => {
  try {
    const support = await Support.findOne({ where: { id } })

    if (!support) {
      throw new APIError("Esta item não existe.");
    }

    req.support = support; // eslint-disable-line no-param-reassign

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
 * Get support
 * @returns {Support}
 */
const get = async (req, res) => {
  const { support, user } = req;

  try {
    return res.json({
      data: support,
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
 * Create new support
 * @returns {Support}
 */
const create = async (req, res, next) => {
  const { title, description, active, url_video } = req.body;
  const { user } = req;

  const t = await sequelize.transaction();
  try {
    if (!user.roleIds.includes(1) && !user.roleIds.includes(3)) {
      throw new APIError("Você não tem permissão para criar isto.");
    }

    const newSupport = await Support.create({
      title,
      description,
      active,
      url_video
    }, { transaction: t });

    if (!newSupport) {
      throw new APIError("Houve um erro ao criar o item.");
    }

    await t.commit();

    return res.json({
      success: true,
      message: 'Item criado com sucesso!'
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
 * Update existing support
 * @returns {Support}
 */
const update = async (req, res, next) => {
  const { title, description, active, url_video } = req.body;
  const { support, user } = req;

  const u = await sequelize.transaction();
  try {
    if (!user.roleIds.includes(1) && !user.roleIds.includes(3)) {
      throw new APIError("Você não possui permissão para atualizar isto.");
    }

    const updatedSupport = await support.update({
      title,
      description,
      active,
      url_video
    }, { transaction: u });

    if (!updatedSupport) {
      throw new APIError("Houve uma erro ao atualizar o item.");
    }

    u.commit();

    return res.json({
      success: true,
      message: "Item atualizado com sucesso!"
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
 * Get support list.
 * @returns {Support[]}
 */
const list = async (req, res, next) => {
  const { limit = 20, page = 1, search = null} = req.query;
  const offset = 0 + (parseInt(page) - 1) * limit;

  try {
    let where = {
      active: true
    }

    if (!!search) {
      where = {...where, [Op.or]: {
        title: {
          [Op.iLike]: "%" + search
        },
        description: {
          [Op.iLike]: "%" + search
        }
      }}
    }

    const supports = await Support.findAndCountAll({
      where,
      order: [['createdAt', 'ASC']],
      limit,
      offset
    });

    if (!supports) {
      throw new APIError("Não foi possível trazer a lista de items.");
    }

    return res.json({
      success: true,
      data: supports.rows,
      pagination: {
        limit,
        offset,
        page: parseInt(page),
        count: supports.count,
        nextPage: offset + limit <= supports.count
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
  const { user, support } = req;

  const t = await sequelize.transaction();
  try {
    if (!user.roleIds.includes(1) && !user.roleIds.includes(3)) {
      throw new APIError("Você não possui permissão para excluir este item.");
    }

    const deletedSupport = await support.destroy({ transaction: t });

    if (!deletedSupport) {
      throw new APIError("Houve uma erro ao excluir o item.");
    }

    t.commit();

    return res.json({
      success: true,
      message: "Item excluído com sucesso!"
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
