import httpStatus from 'http-status';
import db from '../models';
import APIError from '../helpers/APIError';

const { Subject, sequelize } = db;

/**
 * Load subject and append to req.
 */
const load = async (req, res, next, id) => {
  try {
    const subject = await Subject.findOne({ where: { id } })

    if (!subject) {
      throw new APIError("Esta disciplina não existe.");
    }

    req.subject = subject; // eslint-disable-line no-param-reassign

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
 * Get subject
 * @returns {Subject}
 */
const get = async (req, res) => {
  const { subject, user } = req;

  try {
    if (!user.roleIds.includes(1)) {
      throw new APIError("Não é possível visualizar uma disciplina diferente do seu.");
    }

    return res.json({
      data: subject,
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
 * Create new subject
 * @returns {Subject}
 */
const create = async (req, res, next) => {
  const { title, description, active, GradeId } = req.body;
  const { user } = req;

  const t = await sequelize.transaction();
  try {
    if (!user.roleIds.includes(1)) {
      throw new APIError("Você não tem permissão para criar disciplinas.");
    }

    const newSubject = await Subject.create({
      title,
      description,
      active,
      GradeId
    }, { transaction: t });

    if (!newSubject) {
      throw new APIError("Houve um erro ao criar o disciplina.");
    }

    await t.commit();

    return res.json({
      success: true,
      message: 'Disciplina criada com sucesso!'
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
 * Update existing subject
 * @returns {Subject}
 */
const update = async (req, res, next) => {
  const { title, description, active, GradeId } = req.body;
  const { subject, user } = req;

  const u = await sequelize.transaction();
  try {
    if (!user.roleIds.includes(1)) {
      throw new APIError("Você não possui permissão para atualizar disciplina.");
    }

    const updatedSubject = await subject.update({
      title,
      description,
      active,
      GradeId
    }, { transaction: u });

    if (!updatedSubject) {
      throw new APIError("Houve uma erro ao atualizar o disciplina.");
    }

    u.commit();

    return res.json({
      success: true,
      message: "Disciplina atualizada com sucesso!"
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
 * Get subject list.
 * @returns {Subject[]}
 */
const list = async (req, res, next) => {
  const { limit = 20, page = 1, active = true, GradeId } = req.query;
  const offset = 0 + (parseInt(page) - 1) * limit;

  try {
    const subjects = await Subject.findAndCountAll({
      where: GradeId ? {
        active,
        GradeId
      } : {
          active
        },
      attributes: ['id', 'title', 'description', 'active', 'GradeId'],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    if (!subjects) {
      throw new APIError("Não foi possível trazer a lista de disciplinas.");
    }

    return res.json({
      success: true,
      data: subjects.rows,
      pagination: {
        limit,
        offset,
        page: parseInt(page),
        count: subjects.count,
        nextPage: offset + limit <= subjects.count
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
  const { user, subject } = req;

  const t = await sequelize.transaction();
  try {
    if (!user.roleIds.includes(1)) {
      throw new APIError("Você não possui permissão para excluir esta disciplina.");
    }

    const deletedSubject = await subject.destroy({ transaction: t });

    if (!deletedSubject) {
      throw new APIError("Houve uma erro ao excluir a disciplina.");
    }

    t.commit();

    return res.json({
      success: true,
      message: "Disciplina excluída com sucesso!"
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
