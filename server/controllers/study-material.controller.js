import httpStatus from 'http-status';
import db from '../models';
import APIError from '../helpers/APIError';
import replaceSpecialChars from "../helpers/textNormalize";
import path from 'path';
import fs from 'fs-extra';
import { writeFile } from 'fs';

const {
  Study_Material,
  Study_Material_Content,
  Study_Material_Content_Annotation,
  User,
  User_Role_Institution,
  sequelize
} = db;

/**
 * Load study_material and append to req.
 */
const load = async (req, res, next, id) => {
  try {
    const study_material = await Study_Material.findOne({ where: { id } })

    if (!study_material) {
      throw new APIError("Este item não existe.");
    }

    req.study_material = study_material; // eslint-disable-line no-param-reassign

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
 * Get study_material
 * @returns {Study_Material}
 */
const get = async (req, res) => {
  const { study_material, user } = req;

  try {
    return res.json({
      data: study_material,
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
 * Create new study_material
 * @returns {Study_Material}
 */
const create = async (req, res, next) => {
  const { active, title, description, type = 'professor' } = req.body;
  const { user } = req;

  const t = await sequelize.transaction();
  try {
    if (!user.roleIds.includes(1) && !user.roleIds.includes(3)) {
      throw new APIError("Você não tem permissão para criar isto.");
    }

    const newStudy_Material = await Study_Material.create({
      active,
      title,
      description,
      type
    }, { transaction: t });

    if (!newStudy_Material) {
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
 * Update existing study_material
 * @returns {Study_Material}
 */
const update = async (req, res, next) => {
  const { active, title, description } = req.body;
  const { study_material, user } = req;

  const u = await sequelize.transaction();
  try {
    if (!user.roleIds.includes(1)) {
      throw new APIError("Você não possui permissão para atualizar isto.");
    }

    const updatedStudy_Material = await study_material.update({
      active,
      title,
      description
    }, { transaction: u });

    if (!updatedStudy_Material) {
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
 * Get study_material list.
 * @returns {Study_Material[]}
 */
const list = async (req, res, next) => {
  const { limit = 20, page = 1, active = true, type = 'professor' } = req.query;
  const offset = 0 + (parseInt(page) - 1) * limit;

  try {
    let where = {
      active,
      type
    }
    const study_materials = await Study_Material.findAndCountAll({
      where,
      order: [['createdAt', 'ASC']],
      limit,
      offset
    });

    if (!study_materials) {
      throw new APIError("Não foi possível trazer a lista.");
    }

    return res.json({
      success: true,
      data: study_materials.rows,
      pagination: {
        limit,
        offset,
        page: parseInt(page),
        count: study_materials.count,
        nextPage: offset + limit <= study_materials.count
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
  const { user, study_material } = req;

  const t = await sequelize.transaction();
  try {
    if (!user.roleIds.includes(1)) {
      throw new APIError("Você não possui permissão para excluir isto.");
    }

    const deletedStudy_Material = await study_material.destroy({ transaction: t });

    if (!deletedStudy_Material) {
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

const createStudyMaterialImageUpload = async (req, res, next) => {
  const { file, user, study_material } = req;

  const t = await sequelize.transaction();
  try {
    if (!user.roleIds.includes(1) && !user.roleIds.includes(3)) {
      throw new APIError("Você não possui permissão para atualizar isto.", httpStatus.UNAUTHORIZED);
    }

    const filename = Date.now() + '_' + replaceSpecialChars(path.basename(file.originalname)) + path.extname(file.originalname);
    const filePath = 'static/files/studymaterials/' + filename

    fs.ensureDir((process.env.NODE_ENV === 'production' ? '/var/www/api.teachlearn.com.br/' : '') + path.dirname(filePath), { mode: 0o2775 }, (err) => {
      if (err) throw new APIError("Erro ao gerar pastas para salvar arquivo.");
      writeFile((process.env.NODE_ENV === 'production' ? '/var/www/api.teachlearn.com.br/' : '') + filePath, file.buffer, (err) => {
        if (err) {
          throw new APIError("Erro ao gravar arquivo.");
        }
      })
    });

    const updatedStudyMaterial = await study_material.update({
      photo: (process.env.NODE_ENV === 'production' ? 'https' : req.protocol) + '://' + req.get('host') + '/' + filePath
    }, { transaction: t });

    if (!updatedStudyMaterial) {
      throw new APIError("Houve um erro ao atualizar a foto do material de estudo.");
    }

    t.commit();

    return res.json({
      success: true,
      url_storage: updatedStudyMaterial.photo,
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

const listStudyMaterialContent = async (req, res, next) => {
  const { limit = 20, page = 1, StudyMaterialId, active } = req.query;
  const offset = 0 + (parseInt(page) - 1) * limit;

  try {
    if (!StudyMaterialId) {
      throw new APIError("StudyMaterialId é obrigatório.")
    }

    let where = {
      StudyMaterialId
    }

    if (!!active) {
      where = {...where, active}
    }

    const studyMaterialContent = await Study_Material_Content.findAndCountAll({
      where,
      order: [['createdAt', 'ASC']],
      limit,
      offset
    });

    if (!studyMaterialContent) {
      throw new APIError("Não foi possível trazer a lista de items.");
    }

    return res.json({
      success: true,
      data: studyMaterialContent.rows,
      pagination: {
        limit,
        offset,
        page: parseInt(page),
        count: studyMaterialContent.count,
        nextPage: offset + limit <= studyMaterialContent.count
      }
    })
  } catch (err) {
    return res.status(err.status ? err.status : 500).json({
      success: false,
      message: err.message
    })
  }
}

const createStudyMaterialContent = async (req, res, next) => {
  const { title, active, StudyMaterialId, content, url_video, source_video } = req.body;
  const { user } = req;

  const t = await sequelize.transaction();
  try {
    if (!user.roleIds.includes(1) && !user.roleIds.includes(3)) {
      throw new APIError("Você não tem permissão para criar isto.");
    }

    const newStudyMaterialContent = await Study_Material_Content.create({
      title,
      active,
      StudyMaterialId,
      content,
      url_video,
      source_video
    }, { transaction: t });

    if (!newStudyMaterialContent) {
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

const getStudyMaterialContent = async (req, res, next) => {
  const { studyMaterialContentId } = req.params;
  const { user } = req;

  try {
    const getStudyMaterialContentAnnotation = await Study_Material_Content_Annotation.findOrCreate({
      where: {
        StudyMaterialContentId: studyMaterialContentId,
        UserId: user.id
      },
      defaults: {
        content: ''
      }
    })

    if (!getStudyMaterialContentAnnotation) {
      throw new APIError("Houve um erro na criação da caixa de anotação deste item.")
    }

    const studyMaterialContent = await Study_Material_Content.findOne({
      where: {
        id: studyMaterialContentId
      },
      include: [
        {
          model: Study_Material_Content_Annotation,
          where: {
            UserId: user.id
          },
          attributes: {
            exclude: ['createdAt', 'updatedAt']
          }
        }
      ]
    })

    if (!studyMaterialContent) {
      throw new APIError("Item não encontrado.", httpStatus.NOT_FOUND)
    }

    return res.json({
      data: studyMaterialContent,
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

const updateStudyMaterialContent = async (req, res, next) => {
  const { title, active, content, url_video, source_video } = req.body;
  const { studyMaterialContentId } = req.params;
  const { user } = req;

  const u = await sequelize.transaction();
  try {
    if (!user.roleIds.includes(1) && !user.roleIds.includes(3)) {
      throw new APIError("Você não possui permissão para atualizar isto.");
    }

    const StudyMaterialContent = await Study_Material_Content.findOne({
      where: {
        id: studyMaterialContentId
      }
    })

    if (!StudyMaterialContent) {
      throw new APIError("Item não encontrado.")
    }

    const updatedStudyMaterialContent = await StudyMaterialContent.update({
      title,
      active,
      content,
      url_video,
      source_video
    }, { transaction: u });

    if (!updatedStudyMaterialContent) {
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

const removeStudyMaterialContent = async (req, res, next) => {
  const { studyMaterialContentId } = req.params;
  const { user } = req;

  const t = await sequelize.transaction();
  try {
    if (!user.roleIds.includes(1) && !user.roleIds.includes(3)) {
      throw new APIError("Você não possui permissão para excluir este item.");
    }

    const studyMaterialContent = await Study_Material_Content.findOne({
      where: {
        id: studyMaterialContentId
      }
    })

    if (!studyMaterialContent) {
      throw new APIError("Item não encontrado.")
    }

    const deletedStudyMaterialContent = await studyMaterialContent.destroy({ transaction: t });

    if (!deletedStudyMaterialContent) {
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

const addStudyMaterialContentAnnotation = async (req, res, next) => {
  const { content } = req.body;
  const { studyMaterialContentAnnotationId } = req.params;
  const { user } = req;

  const t = await sequelize.transaction();
  try {
    const studyMaterialContentAnnotation = await Study_Material_Content_Annotation.findOne({
      where: {
        StudyMaterialContentId: studyMaterialContentAnnotationId,
        UserId: user.id
      }
    })

    if (!studyMaterialContentAnnotation) {
      throw new APIError("Item não encontrado.", httpStatus.NOT_FOUND)
    }

    const udatedstudyMaterialContentAnnotation = await studyMaterialContentAnnotation.update({
      content
    }, { transaction: t });

    if (!udatedstudyMaterialContentAnnotation) {
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
  listStudyMaterialContent,
  createStudyMaterialContent,
  getStudyMaterialContent,
  updateStudyMaterialContent,
  removeStudyMaterialContent,
  addStudyMaterialContentAnnotation,
  createStudyMaterialImageUpload
};
