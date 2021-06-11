import httpStatus from 'http-status';
import db from '../models';
import APIError from '../helpers/APIError';

const { Area, sequelize } = db;

/**
 * Load area and append to req.
 */
const load = async (req, res, next, id) => {
  try {
    const area = await Area.findOne({ where: { id } })

    if (!area) {
      throw new APIError("Esta area não existe.");
    }

    req.area = area; // eslint-disable-line no-param-reassign

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
 * Get area
 * @returns {Area}
 */
const get = async (req, res) => {
  const { area, user } = req;

  try {
    if (!user.roleIds.includes(1)) {
      throw new APIError("Não é possível visualizar uma area diferente do seu.");
    }

    return res.json({
      data: area,
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
 * Create new area
 * @returns {Area}
 */
const create = async (req, res, next) => {
  const { title, description, active, father } = req.body;
  const { user } = req;

  const t = await sequelize.transaction();
  try {
    if (!user.roleIds.includes(1)) {
      throw new APIError("Você não tem permissão para criar areas.");
    }

    const newArea = await Area.create({
      title,
      description,
      active,
      father
    }, { transaction: t });

    if (!newArea) {
      throw new APIError("Houve uma erro ao criar a area.");
    }

    await t.commit();

    return res.json({
      success: true,
      message: 'Area criada com sucesso!'
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
 * Update existing area
 * @returns {Area}
 */
const update = async (req, res, next) => {
  const { title, description, active } = req.body;
  const { area, user } = req;

  const u = await sequelize.transaction();
  try {
    if (!user.roleIds.includes(1)) {
      throw new APIError("Você não possui permissão para atualizar area.");
    }

    const updatedArea = await area.update({
      title,
      description,
      active
    }, { transaction: u });

    if (!updatedArea) {
      throw new APIError("Houve uma erro ao atualizar a area.");
    }

    u.commit();

    return res.json({
      success: true,
      message: "Area atualizada com sucesso!"
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
 * Get area list.
 * @returns {Area[]}
 */
const list = async (req, res, next) => {
  const { limit = 20, page = 1, active = true, father, tree = 0 } = req.query;
  const offset = 0 + (parseInt(page) - 1) * limit;

  try {
    const areas = await Area.findAndCountAll({
      where: father ? {
        active,
        father
      } : {
          active
        },
      attributes: ['id', 'title', 'description', 'active', 'father'],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    if (!areas) {
      throw new APIError("Não foi possível trazer a lista de areas.");
    }

    return res.json({
      success: true,
      data: tree === 0 ? areas.rows : buildTree(areas.rows),
      pagination: {
        limit,
        offset,
        page: parseInt(page),
        count: areas.count,
        nextPage: offset + limit <= areas.count
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
  const { user, area } = req;

  const t = await sequelize.transaction();
  try {
    if (!user.roleIds.includes(1)) {
      throw new APIError("Você não possui permissão para excluir este area.");
    }

    const deletedArea = await area.destroy({ transaction: t });

    if (!deletedArea) {
      throw new APIError("Houve uma erro ao excluir a area.");
    }

    t.commit();

    return res.json({
      success: true,
      message: "Area excluída com sucesso!"
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

const buildTree = (elements, parentId = null) => {
  const branch = [];

  elements.forEach(element => {
    if (element.father === parentId) {
      const children = buildTree(elements, element.id);

      if (children) {
        element.children = children;
      }

      branch.push(element);
    }
  });


  return branch;
}

export default {
  load,
  get,
  create,
  update,
  list,
  remove
};
