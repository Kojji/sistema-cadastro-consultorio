import httpStatus from 'http-status';
import db from '../models';
import APIError from '../helpers/APIError';

const { Course, sequelize } = db;

/**
 * Load course and append to req.
 */
const load = async (req, res, next, id) => {
  try {
    const course = await Course.findOne({ where: { id } })

    if (!course) {
      throw new APIError("Este curso não existe.");
    }

    req.course = course; // eslint-disable-line no-param-reassign

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
 * Get course
 * @returns {Course}
 */
const get = async (req, res) => {
  const { course, user } = req;

  try {
    if (!user.roleIds.includes(1)) {
      throw new APIError("Não é possível visualizar um curso diferente do seu.");
    }

    return res.json({
      data: course,
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
 * Create new course
 * @returns {Course}
 */
const create = async (req, res, next) => {
  const { title, description, active, LevelId } = req.body;
  const { user } = req;

  const t = await sequelize.transaction();
  try {
    if (!user.roleIds.includes(1)) {
      throw new APIError("Você não tem permissão para criar cursos.");
    }

    const newCourse = await Course.create({
      title,
      description,
      active,
      LevelId
    }, { transaction: t });

    if (!newCourse) {
      throw new APIError("Houve um erro ao criar o curso.");
    }

    await t.commit();

    return res.json({
      success: true,
      message: 'Curso criado com sucesso!'
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
 * Update existing course
 * @returns {Course}
 */
const update = async (req, res, next) => {
  const { title, description, active, LevelId } = req.body;
  const { course, user } = req;

  const u = await sequelize.transaction();
  try {
    if (!user.roleIds.includes(1)) {
      throw new APIError("Você não possui permissão para atualizar curso.");
    }

    const updatedCourse = await course.update({
      title,
      description,
      active,
      LevelId
    }, { transaction: u });

    if (!updatedCourse) {
      throw new APIError("Houve um erro ao atualizar o curso.");
    }

    u.commit();

    return res.json({
      success: true,
      message: "Curso atualizado com sucesso!"
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
 * Get course list.
 * @returns {Course[]}
 */
const list = async (req, res, next) => {
  const { limit = 20, page = 1, active = true, LevelId } = req.query;
  const offset = 0 + (parseInt(page) - 1) * limit;

  try {
    const courses = await Course.findAndCountAll({
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

    if (!courses) {
      throw new APIError("Não foi possível trazer a lista de cursos.");
    }

    return res.json({
      success: true,
      data: courses.rows,
      pagination: {
        limit,
        offset,
        page: parseInt(page),
        count: courses.count,
        nextPage: offset + limit <= courses.count
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
  const { user, course } = req;

  const t = await sequelize.transaction();
  try {
    if (!user.roleIds.includes(1)) {
      throw new APIError("Você não possui permissão para excluir este curso.");
    }

    const deletedCourse = await course.destroy({ transaction: t });

    if (!deletedCourse) {
      throw new APIError("Houve um erro ao excluir o curso.");
    }

    t.commit();

    return res.json({
      success: true,
      message: "Curso excluído com sucesso!"
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
