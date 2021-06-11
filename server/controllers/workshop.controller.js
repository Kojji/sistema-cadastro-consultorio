import httpStatus from 'http-status';
import db from '../models';
import APIError from '../helpers/APIError';
import replaceSpecialChars from "../helpers/textNormalize";
import momentTz from 'moment-timezone'
import path from 'path';
import fs from 'fs-extra';
import { writeFile } from 'fs';
import { Op } from 'sequelize';

const {
  Workshop,
  Workshop_Module,
  Workshop_Module_Class,
  Workshop_Module_Class_File,
  Workshop_Module_Class_Annotation,
  File,
  User,
  sequelize
} = db;

/**
 * Load workshop and append to req.
 */
const load = async (req, res, next, id) => {
  try {
    const workshop = await Workshop.findOne({ where: { id } })

    if (!workshop) {
      throw new APIError("Esta item não existe.");
    }

    req.workshop = workshop; // eslint-disable-line no-param-reassign

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
 * Get workshop
 * @returns {Workshop}
 */
const get = async (req, res) => {
  const { workshop, user } = req;

  try {
    return res.json({
      data: workshop,
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
 * Create new workshop
 * @returns {Workshop}
 */
const create = async (req, res, next) => {
  const { title, description, active, url_external, type = "professor" } = req.body;
  const { user } = req;

  const t = await sequelize.transaction();
  try {
    if (!user.roleIds.includes(1) && !user.roleIds.includes(3)) {
      throw new APIError("Você não tem permissão para criar isto.");
    }

    const newWorkshop = await Workshop.create({
      title,
      description,
      active,
      url_external,
      type
    }, { transaction: t });

    if (!newWorkshop) {
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
 * Update existing workshop
 * @returns {Workshop}
 */
const update = async (req, res, next) => {
  const { title, description, active, url_external, type } = req.body;
  const { workshop, user } = req;

  const u = await sequelize.transaction();
  try {
    if (!user.roleIds.includes(1) && !user.roleIds.includes(3)) {
      throw new APIError("Você não possui permissão para atualizar isto.", httpStatus.UNAUTHORIZED);
    }

    const updatedWorkshop = await workshop.update({
      title,
      description,
      active,
      url_external,
      type
    }, { transaction: u });

    if (!updatedWorkshop) {
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

/**
 * Get workshop list.
 * @returns {Workshop[]}
 */
const list = async (req, res, next) => {
  const { limit = 20, page = 1, search = null, type = "professor", active = true} = req.query;
  const offset = 0 + (parseInt(page) - 1) * limit;

  try {
    let where = {
      active,
      type
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

    const workshops = await Workshop.findAndCountAll({
      where,
      order: [['createdAt', 'ASC']],
      limit,
      offset
    });

    if (!workshops) {
      throw new APIError("Não foi possível trazer a lista de items.");
    }

    return res.json({
      success: true,
      data: workshops.rows,
      pagination: {
        limit,
        offset,
        page: parseInt(page),
        count: workshops.count,
        nextPage: offset + limit <= workshops.count
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
  const { user, workshop } = req;

  const t = await sequelize.transaction();
  try {
    if (!user.roleIds.includes(1) && !user.roleIds.includes(3)) {
      throw new APIError("Você não possui permissão para excluir este item.");
    }

    const deletedWorkshop = await workshop.destroy({ transaction: t });

    if (!deletedWorkshop) {
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

const createWorkshopImageUpload = async (req, res, next) => {
  const { file, user, workshop } = req;

  const t = await sequelize.transaction();
  try {
    if (!user.roleIds.includes(1) && !user.roleIds.includes(3)) {
      throw new APIError("Você não possui permissão para atualizar isto.", httpStatus.UNAUTHORIZED);
    }

    const filename = Date.now() + '_' + replaceSpecialChars(path.basename(file.originalname)) + path.extname(file.originalname);
    const filePath = 'static/files/workshops/' + filename

    fs.ensureDir((process.env.NODE_ENV === 'production' ? '/var/www/api.teachlearn.com.br/' : '') + path.dirname(filePath), { mode: 0o2775 }, (err) => {
      if (err) throw new APIError("Erro ao gerar pastas para salvar arquivo.");
      writeFile((process.env.NODE_ENV === 'production' ? '/var/www/api.teachlearn.com.br/' : '') + filePath, file.buffer, (err) => {
        if (err) {
          throw new APIError("Erro ao gravar arquivo.");
        }
      })
    });

    const updatedWorkshop = await workshop.update({
      photo: (process.env.NODE_ENV === 'production' ? 'https' : req.protocol) + '://' + req.get('host') + '/' + filePath
    }, { transaction: t });

    if (!updatedWorkshop) {
      throw new APIError("Houve um erro ao atualizar a foto do workshop.");
    }

    t.commit();

    return res.json({
      success: true,
      url_storage: updatedWorkshop.photo,
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

const listModules = async (req, res, next) => {
  const { limit = 20, page = 1, WorkshopId} = req.query;
  const { user } = req;
  const offset = 0 + (parseInt(page) - 1) * limit;

  try {
    if (!WorkshopId) {
      throw new APIError("WorkshopId é obrigatório.")
    }

    let where = {
      WorkshopId
    }

    const workshopModules = await Workshop_Module.findAndCountAll({
      where,
      order: [['createdAt', 'ASC']],
      limit,
      offset
    });

    if (!workshopModules) {
      throw new APIError("Não foi possível trazer a lista de items.");
    }

    const today = momentTz().tz('America/Sao_Paulo')
    const createdAt = momentTz(user.createdAt).tz('America/Sao_Paulo')
    const diff = today.diff(createdAt, 'days')

    workshopModules.rows.forEach(module => {
      module.setDataValue('available', module.available_in <= diff)
    })

    return res.json({
      success: true,
      data: workshopModules.rows,
      pagination: {
        limit,
        offset,
        page: parseInt(page),
        count: workshopModules.count,
        nextPage: offset + limit <= workshopModules.count
      }
    })
  } catch (err) {
    return res.status(err.status ? err.status : 500).json({
      success: false,
      message: err.message
    })
  }
}

const createModule = async (req, res, next) => {
  const { title, active, WorkshopId, available_in } = req.body;
  const { user } = req;

  const t = await sequelize.transaction();
  try {
    if (!user.roleIds.includes(1) && !user.roleIds.includes(3)) {
      throw new APIError("Você não tem permissão para criar isto.");
    }

    const newWorkshop = await Workshop_Module.create({
      title,
      active,
      available_in,
      WorkshopId
    }, { transaction: t });

    if (!newWorkshop) {
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

const getModule = async (req, res, next) => {
  const { workshopModuleId } = req.params;
  // const { workshop, user } = req;

  try {
    const workshopModule = await Workshop_Module.findOne({
      where: {
        id: workshopModuleId
      }
    })

    if (!workshopModule) {
      throw new APIError("Item não encontrado.")
    }

    return res.json({
      data: workshopModule,
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

const updateModule = async (req, res, next) => {
  const { title, active, available_in } = req.body;
  const { workshopModuleId } = req.params;
  const { user } = req;

  const u = await sequelize.transaction();
  try {
    if (!user.roleIds.includes(1) && !user.roleIds.includes(3)) {
      throw new APIError("Você não possui permissão para atualizar isto.");
    }

    const workshopModule = await Workshop_Module.findOne({
      where: {
        id: workshopModuleId
      }
    })

    if (!workshopModule) {
      throw new APIError("Item não encontrado.")
    }

    const updatedWorkshop = await workshopModule.update({
      title,
      active,
      available_in
    }, { transaction: u });

    if (!updatedWorkshop) {
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

const removeModule = async (req, res, next) => {
  const { workshopModuleId } = req.params;
  const { user } = req;

  const t = await sequelize.transaction();
  try {
    if (!user.roleIds.includes(1) && !user.roleIds.includes(3)) {
      throw new APIError("Você não possui permissão para excluir este item.");
    }

    const workshopModule = await Workshop_Module.findOne({
      where: {
        id: workshopModuleId
      }
    })

    if (!workshopModule) {
      throw new APIError("Item não encontrado.")
    }

    const deletedWorkshopModule = await workshopModule.destroy({ transaction: t });

    if (!deletedWorkshopModule) {
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

const listModulesClass = async (req, res, next) => {
  const { limit = 20, page = 1, WorkshopModuleId} = req.query;
  const offset = 0 + (parseInt(page) - 1) * limit;

  try {
    if (!WorkshopModuleId) {
      throw new APIError("WorkshopModuleId é obrigatório.")
    }

    let where = {
      WorkshopModuleId
    }

    const workshopModuleClasses = await Workshop_Module_Class.findAndCountAll({
      where,
      order: [['createdAt', 'ASC']],
      limit,
      offset
    });

    if (!workshopModuleClasses) {
      throw new APIError("Não foi possível trazer a lista de items.");
    }

    return res.json({
      success: true,
      data: workshopModuleClasses.rows,
      pagination: {
        limit,
        offset,
        page: parseInt(page),
        count: workshopModuleClasses.count,
        nextPage: offset + limit <= workshopModuleClasses.count
      }
    })
  } catch (err) {
    return res.status(err.status ? err.status : 500).json({
      success: false,
      message: err.message
    })
  }
}

const createModuleClass = async (req, res, next) => {
  const { title, active, WorkshopModuleId, description, url_video, source_video, fileIds = [] } = req.body;
  const { user } = req;

  const t = await sequelize.transaction();
  try {
    if (!user.roleIds.includes(1) && !user.roleIds.includes(3)) {
      throw new APIError("Você não tem permissão para criar isto.");
    }

    const newWorkshop = await Workshop_Module_Class.create({
      title,
      active,
      WorkshopModuleId,
      description,
      url_video,
      source_video
    }, { transaction: t });

    if (!newWorkshop) {
      throw new APIError("Houve um erro ao criar o item.");
    }

    await t.commit();

    let promises = []
    fileIds.forEach(row => {
      promises.push(Workshop_Module_Class_File.create({
        FileId: row,
        WorkshopModuleClassId: newWorkshop.id
      }))
    })

    await Promise.all(promises)

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

const getModuleClass = async (req, res, next) => {
  const { workshopModuleClassId } = req.params;
  const { user } = req;

  try {
    const getWorkshopModuleClassAnnotation = await Workshop_Module_Class_Annotation.findOrCreate({
      where: {
        WorkshopModuleClassId: workshopModuleClassId,
        UserId: user.id
      },
      defaults: {
        content: ''
      }
    })

    if (!getWorkshopModuleClassAnnotation) {
      throw new APIError("Houve um erro na criação da caixa de anotação deste item.")
    }

    const workshopModuleClass = await Workshop_Module_Class.findOne({
      where: {
        id: workshopModuleClassId
      },
      include: [
        {
          model: Workshop_Module_Class_File,
          include: [
            {
              model: File,
              attributes: ['id', 'name', 'url_storage']
            }
          ],
          attributes: {
            exclude: ['createdAt', 'updatedAt']
          }
        },
        {
          model: Workshop_Module_Class_Annotation,
          where: {
            UserId: user.id
          },
          attributes: {
            exclude: ['createdAt', 'updatedAt']
          }
        },
        {
          model: Workshop_Module,
          attributes: ['WorkshopId']
        }
      ]
    })

    if (!workshopModuleClass) {
      throw new APIError("Item não encontrado.")
    }

    const getModulesAndClasses = await Workshop_Module.findAll({
      where: {
        WorkshopId: workshopModuleClass.Workshop_Module.WorkshopId,
        active: true
      },
      attributes: ['id', 'title', 'available_in'],
      include: [
        {
          model: Workshop_Module_Class,
          attributes: ['id', 'title', 'description'],
          where: {
            active: true
          }
        }
      ]
    })

    const today = momentTz().tz('America/Sao_Paulo')
    const createdAt = momentTz(user.createdAt).tz('America/Sao_Paulo')
    const diff = today.diff(createdAt, 'days')

    getModulesAndClasses.forEach(module => {
      module.setDataValue('available', module.available_in <= diff)
    })

    return res.json({
      data: workshopModuleClass,
      modules: getModulesAndClasses,
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

const updateModuleClass = async (req, res, next) => {
  const { title, active, description, url_video, source_video, fileIds } = req.body;
  const { workshopModuleClassId } = req.params;
  const { user } = req;

  const u = await sequelize.transaction();
  try {
    if (!user.roleIds.includes(1) && !user.roleIds.includes(3)) {
      throw new APIError("Você não possui permissão para atualizar isto.");
    }

    const workshopModuleClass = await Workshop_Module_Class.findOne({
      where: {
        id: workshopModuleClassId
      }
    })

    if (!workshopModuleClass) {
      throw new APIError("Item não encontrado.")
    }

    const updatedWorkshop = await workshopModuleClass.update({
      title,
      active,
      description,
      url_video,
      source_video
    }, { transaction: u });

    if (!updatedWorkshop) {
      throw new APIError("Houve uma erro ao atualizar o item.");
    }

    const destroyAllFiles = await Workshop_Module_Class_File.destroy({
      where: {
        WorkshopModuleClassId: workshopModuleClass.id
      },
      truncate: true
    })

    let promises = []
    fileIds.forEach(row => {
      promises.push(Workshop_Module_Class_File.create({
        FileId: row,
        WorkshopModuleClassId: workshopModuleClass.id
      }))
    })

    await Promise.all(promises)

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

const removeModuleClass = async (req, res, next) => {
  const { workshopModuleClassId } = req.params;
  const { user } = req;

  const t = await sequelize.transaction();
  try {
    if (!user.roleIds.includes(1) && !user.roleIds.includes(3)) {
      throw new APIError("Você não possui permissão para excluir este item.");
    }

    const workshopModuleClass = await Workshop_Module_Class.findOne({
      where: {
        id: workshopModuleClassId
      }
    })

    if (!workshopModuleClass) {
      throw new APIError("Item não encontrado.")
    }

    const deletedWorkshopModule = await workshopModuleClass.destroy({ transaction: t });

    if (!deletedWorkshopModule) {
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

const addWorkshopModuleClassAnnotation = async (req, res, next) => {
  const { content } = req.body;
  const { workshopModuleClassAnnotationId } = req.params;
  const { user } = req;

  const t = await sequelize.transaction();
  try {
    const workshopModuleClassAnnotation = await Workshop_Module_Class_Annotation.findOne({
      where: {
        WorkshopModuleClassId: workshopModuleClassAnnotationId,
        UserId: user.id
      }
    })

    if (!workshopModuleClassAnnotation) {
      throw new APIError("Item não encontrado.", httpStatus.NOT_FOUND)
    }

    const udatedworkshopModuleClassAnnotation = await workshopModuleClassAnnotation.update({
      content
    }, { transaction: t });

    if (!udatedworkshopModuleClassAnnotation) {
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
  listModules,
  createModule,
  getModule,
  updateModule,
  removeModule,
  listModulesClass,
  createModuleClass,
  getModuleClass,
  updateModuleClass,
  removeModuleClass,
  addWorkshopModuleClassAnnotation,
  createWorkshopImageUpload
};
