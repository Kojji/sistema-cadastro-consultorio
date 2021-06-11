import httpStatus from 'http-status';
import db from '../models';
import APIError from '../helpers/APIError';

const { Grade, sequelize } = db;

/**
 * Load grade and append to req.
 */
const load = async (req, res, next, id) => {
  try {
    const grade = await Grade.findOne({ where: { id } })

    if (!grade) {
      throw new APIError("Este ano não existe.");
    }

    req.grade = grade; // eslint-disable-line no-param-reassign

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
 * Get grade
 * @returns {Grade}
 */
const get = async (req, res) => {
  const { grade, user } = req;

  try {
    if (!user.roleIds.includes(1)) {
      throw new APIError("Não é possível visualizar um ano diferente do seu.");
    }

    return res.json({
      data: grade,
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
 * Create new grade
 * @returns {Grade}
 */
const create = async (req, res, next) => {
  const { title, description, active, LevelId } = req.body;
  const { user } = req;

  const t = await sequelize.transaction();
  try {
    if (!user.roleIds.includes(1)) {
      throw new APIError("Você não tem permissão para criar anos.");
    }

    const newGrade = await Grade.create({
      title,
      description,
      active,
      LevelId
    }, { transaction: t });

    if (!newGrade) {
      throw new APIError("Houve um erro ao criar o ano.");
    }

    await t.commit();

    return res.json({
      success: true,
      message: 'Ano criado com sucesso!'
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
 * Update existing grade
 * @returns {Grade}
 */
const update = async (req, res, next) => {
  const { title, description, active, LevelId } = req.body;
  const { grade, user } = req;

  const u = await sequelize.transaction();
  try {
    if (!user.roleIds.includes(1)) {
      throw new APIError("Você não possui permissão para atualizar ano.");
    }

    const updatedGrade = await grade.update({
      title,
      description,
      active,
      LevelId
    }, { transaction: u });

    if (!updatedGrade) {
      throw new APIError("Houve um erro ao atualizar o ano.");
    }

    u.commit();

    return res.json({
      success: true,
      message: "Ano atualizado com sucesso!"
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
 * Get grade list.
 * @returns {Grade[]}
 */
const list = async (req, res, next) => {
  const { limit = 20, page = 1, active = true, LevelId } = req.query;
  const offset = 0 + (parseInt(page) - 1) * limit;

  try {
    const grades = await Grade.findAndCountAll({
      where: LevelId ? {
        active,
        LevelId
      } : {
          active
        },
      attributes: ['id', 'title', 'description', 'active', 'LevelId'],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    if (!grades) {
      throw new APIError("Não foi possível trazer a lista de anos.");
    }

    return res.json({
      success: true,
      data: grades.rows,
      pagination: {
        limit,
        offset,
        page: parseInt(page),
        count: grades.count,
        nextPage: offset + limit <= grades.count
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
  const { user, grade } = req;

  const t = await sequelize.transaction();
  try {
    if (!user.roleIds.includes(1)) {
      throw new APIError("Você não possui permissão para excluir este ano.");
    }

    const deletedGrade = await grade.destroy({ transaction: t });

    if (!deletedGrade) {
      throw new APIError("Houve um erro ao excluir o ano.");
    }

    t.commit();

    return res.json({
      success: true,
      message: "Ano excluído com sucesso!"
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
