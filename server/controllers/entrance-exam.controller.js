import httpStatus from 'http-status';
import db from '../models';
import APIError from '../helpers/APIError';
import replaceSpecialChars from "../helpers/textNormalize";
import path from 'path';
import fs from 'fs-extra';
import { writeFile } from 'fs';

const {
  Entrance_Exam,
  Entrance_Exam_Content,
  Entrance_Exam_Content_Annotation,
  User,
  User_Role_Institution,
  sequelize
} = db;

/**
 * Load entrance_exam and append to req.
 */
const load = async (req, res, next, id) => {
  try {
    const entrance_exam = await Entrance_Exam.findOne({ where: { id } })

    if (!entrance_exam) {
      throw new APIError("Este item não existe.");
    }

    req.entrance_exam = entrance_exam; // eslint-disable-line no-param-reassign

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
 * Get entrance_exam
 * @returns {Entrance_Exam}
 */
const get = async (req, res) => {
  const { entrance_exam, user } = req;

  try {
    return res.json({
      data: entrance_exam,
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
 * Create new entrance_exam
 * @returns {Entrance_Exam}
 */
const create = async (req, res, next) => {
  const { active, title, description, type = 'enem' } = req.body;
  const { user } = req;

  const t = await sequelize.transaction();
  try {
    if (!user.roleIds.includes(1) && !user.roleIds.includes(3)) {
      throw new APIError("Você não tem permissão para criar isto.");
    }

    const newEntrance_Exam = await Entrance_Exam.create({
      active,
      title,
      description,
      type
    }, { transaction: t });

    if (!newEntrance_Exam) {
      throw new APIError("Houve um erro ao criar o isto.");
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
 * Update existing entrance_exam
 * @returns {Entrance_Exam}
 */
const update = async (req, res, next) => {
  const { active, title, description } = req.body;
  const { entrance_exam, user } = req;

  const u = await sequelize.transaction();
  try {
    if (!user.roleIds.includes(1)) {
      throw new APIError("Você não possui permissão para atualizar isto.");
    }

    const updatedEntrance_Exam = await entrance_exam.update({
      active,
      title,
      description
    }, { transaction: u });

    if (!updatedEntrance_Exam) {
      throw new APIError("Houve um erro ao atualizar isto.");
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
 * Get entrance_exam list.
 * @returns {Entrance_Exam[]}
 */
const list = async (req, res, next) => {
  const { limit = 20, page = 1, active = true, type = 'enem' } = req.query;
  const offset = 0 + (parseInt(page) - 1) * limit;

  try {
    let where = {
      active,
      type
    }
    const entrance_exams = await Entrance_Exam.findAndCountAll({
      where,
      order: [['createdAt', 'ASC']],
      limit,
      offset
    });

    if (!entrance_exams) {
      throw new APIError("Não foi possível trazer a lista.");
    }

    return res.json({
      success: true,
      data: entrance_exams.rows,
      pagination: {
        limit,
        offset,
        page: parseInt(page),
        count: entrance_exams.count,
        nextPage: offset + limit <= entrance_exams.count
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
  const { user, entrance_exam } = req;

  const t = await sequelize.transaction();
  try {
    if (!user.roleIds.includes(1)) {
      throw new APIError("Você não possui permissão para excluir isto.");
    }

    const deletedEntrance_Exam = await entrance_exam.destroy({ transaction: t });

    if (!deletedEntrance_Exam) {
      throw new APIError("Houve um erro ao excluir este item.");
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

const createEntranceExamImageUpload = async (req, res, next) => {
  const { file, user, entrance_exam } = req;

  const t = await sequelize.transaction();
  try {
    if (!user.roleIds.includes(1) && !user.roleIds.includes(3)) {
      throw new APIError("Você não possui permissão para atualizar isto.", httpStatus.UNAUTHORIZED);
    }

    const filename = Date.now() + '_' + replaceSpecialChars(path.basename(file.originalname)) + path.extname(file.originalname);
    const filePath = 'static/files/entranceexams/' + filename

    fs.ensureDir((process.env.NODE_ENV === 'production' ? '/var/www/api.teachlearn.com.br/' : '') + path.dirname(filePath), { mode: 0o2775 }, (err) => {
      if (err) throw new APIError("Erro ao gerar pastas para salvar arquivo.");
      writeFile((process.env.NODE_ENV === 'production' ? '/var/www/api.teachlearn.com.br/' : '') + filePath, file.buffer, (err) => {
        if (err) {
          throw new APIError("Erro ao gravar arquivo.");
        }
      })
    });

    const updatedEntranceExam = await entrance_exam.update({
      photo: (process.env.NODE_ENV === 'production' ? 'https' : req.protocol) + '://' + req.get('host') + '/' + filePath
    }, { transaction: t });

    if (!updatedEntranceExam) {
      throw new APIError("Houve um erro ao atualizar a foto.");
    }

    t.commit();

    return res.json({
      success: true,
      url_storage: updatedEntranceExam.photo,
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

const listEntranceExamContent = async (req, res, next) => {
  const { limit = 20, page = 1, EntranceExamId, active } = req.query;
  const offset = 0 + (parseInt(page) - 1) * limit;

  try {
    if (!EntranceExamId) {
      throw new APIError("EntranceExamId é obrigatório.")
    }

    let where = {
      EntranceExamId
    }

    if (!!active) {
      where = {...where, active}
    }

    const entranceExamContent = await Entrance_Exam_Content.findAndCountAll({
      where,
      order: [['createdAt', 'ASC']],
      limit,
      offset
    });

    if (!entranceExamContent) {
      throw new APIError("Não foi possível trazer a lista de items.");
    }

    return res.json({
      success: true,
      data: entranceExamContent.rows,
      pagination: {
        limit,
        offset,
        page: parseInt(page),
        count: entranceExamContent.count,
        nextPage: offset + limit <= entranceExamContent.count
      }
    })
  } catch (err) {
    return res.status(err.status ? err.status : 500).json({
      success: false,
      message: err.message
    })
  }
}

const createEntranceExamContent = async (req, res, next) => {
  const { title, active, EntranceExamId, content, url_video, source_video } = req.body;
  const { user } = req;

  const t = await sequelize.transaction();
  try {
    if (!user.roleIds.includes(1) && !user.roleIds.includes(3)) {
      throw new APIError("Você não tem permissão para criar isto.");
    }

    const newEntranceExamContent = await Entrance_Exam_Content.create({
      title,
      active,
      EntranceExamId,
      content,
      url_video,
      source_video
    }, { transaction: t });

    if (!newEntranceExamContent) {
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

const getEntranceExamContent = async (req, res, next) => {
  const { entranceExamContentId } = req.params;
  const { user } = req;

  try {
    const getEntranceExamContentAnnotation = await Entrance_Exam_Content_Annotation.findOrCreate({
      where: {
        EntranceExamContentId: entranceExamContentId,
        UserId: user.id
      },
      defaults: {
        content: ''
      }
    })

    if (!getEntranceExamContentAnnotation) {
      throw new APIError("Houve um erro na criação da caixa de anotação deste item.")
    }

    const entranceExamContent = await Entrance_Exam_Content.findOne({
      where: {
        id: entranceExamContentId
      },
      include: [
        {
          model: Entrance_Exam_Content_Annotation,
          where: {
            UserId: user.id
          },
          attributes: {
            exclude: ['createdAt', 'updatedAt']
          }
        }
      ]
    })

    if (!entranceExamContent) {
      throw new APIError("Item não encontrado.", httpStatus.NOT_FOUND)
    }

    return res.json({
      data: entranceExamContent,
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

const updateEntranceExamContent = async (req, res, next) => {
  const { title, active, content, url_video, source_video } = req.body;
  const { entranceExamContentId } = req.params;
  const { user } = req;

  const u = await sequelize.transaction();
  try {
    if (!user.roleIds.includes(1) && !user.roleIds.includes(3)) {
      throw new APIError("Você não possui permissão para atualizar isto.");
    }

    const EntranceExamContent = await Entrance_Exam_Content.findOne({
      where: {
        id: entranceExamContentId
      }
    })

    if (!EntranceExamContent) {
      throw new APIError("Item não encontrado.")
    }

    const updatedEntranceExamContent = await EntranceExamContent.update({
      title,
      active,
      content,
      url_video,
      source_video
    }, { transaction: u });

    if (!updatedEntranceExamContent) {
      throw new APIError("Houve uma erro ao atualizar o item.");
    }

    await u.commit();

    return res.json({
      success: true,
      message: "Item atualizado com sucesso!"
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

const removeEntranceExamContent = async (req, res, next) => {
  const { entranceExamContentId } = req.params;
  const { user } = req;

  const t = await sequelize.transaction();
  try {
    if (!user.roleIds.includes(1) && !user.roleIds.includes(3)) {
      throw new APIError("Você não possui permissão para excluir este item.");
    }

    const entranceExamContent = await Entrance_Exam_Content.findOne({
      where: {
        id: entranceExamContentId
      }
    })

    if (!entranceExamContent) {
      throw new APIError("Item não encontrado.")
    }

    const deletedEntranceExamContent = await entranceExamContent.destroy({ transaction: t });

    if (!deletedEntranceExamContent) {
      throw new APIError("Houve uma erro ao excluir o item.");
    }

    await t.commit();

    return res.json({
      success: true,
      message: "Item excluído com sucesso!"
    });
  } catch (err) {
    await t.rollback();
    return res.status(err.status ? err.status : 500).json({
      success: false,
      message: err.message,
      status: err.status ? err.status : 500
    })
  }
}

const addEntranceExamContentAnnotation = async (req, res, next) => {
  const { content } = req.body;
  const { entranceExamContentAnnotationId } = req.params;
  const { user } = req;

  const t = await sequelize.transaction();
  try {
    const entranceExamContentAnnotation = await Entrance_Exam_Content_Annotation.findOne({
      where: {
        EntranceExamContentId: entranceExamContentAnnotationId,
        UserId: user.id
      }
    })

    if (!entranceExamContentAnnotation) {
      throw new APIError("Item não encontrado.", httpStatus.NOT_FOUND)
    }

    const udatedentranceExamContentAnnotation = await entranceExamContentAnnotation.update({
      content
    }, { transaction: t });

    if (!udatedentranceExamContentAnnotation) {
      throw new APIError("Houve uma erro ao atualizar o item.");
    }

    await t.commit();

    return res.json({
      success: true,
      message: "Item atualizado com sucesso!"
    });
  } catch (err) {
    t.rollback();
    return res.status(err.status ? err.status : 500).json({
      success: false,
      message: err.message || "Erro",
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
  remove,
  listEntranceExamContent,
  createEntranceExamContent,
  getEntranceExamContent,
  updateEntranceExamContent,
  removeEntranceExamContent,
  addEntranceExamContentAnnotation,
  createEntranceExamImageUpload
};
