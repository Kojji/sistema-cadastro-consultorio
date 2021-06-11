import httpStatus from 'http-status';
import db from '../models';
import APIError from '../helpers/APIError';
import replaceSpecialChars from "../helpers/textNormalize";
import path from 'path';
import fs from 'fs-extra';
import { writeFile } from 'fs';

const {
  Class_Plan,
  Class_Plan_Content,
  Class_Plan_Content_Page,
  Class_Plan_Content_Page_Item,
  Class_Plan_Content_Page_Item_Annotation,
  Area,
  Level,
  Grade,
  Subject,
  Course,
  User_Area,
  sequelize
} = db;

/**
 * Load classPlan and append to req.
 */
const load = async (req, res, next, id) => {
  try {
    const classPlan = await Class_Plan.findOne({ where: { id } })

    if (!classPlan) {
      throw new APIError("Este Plano de aula não existe.");
    }

    req.classPlan = classPlan; // eslint-disable-line no-param-reassign

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
 * Get classPlan
 * @returns {ClassPlan}
 */
const get = async (req, res) => {
  const { classPlan, user } = req;

  try {
    return res.json({
      data: classPlan,
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
 * Create new classPlan
 * @returns {ClassPlan}
 */
const create = async (req, res, next) => {
  const { active, title, AreaId, SubjectId, LevelId, GradeId, CourseId } = req.body;
  const { user } = req;

  const t = await sequelize.transaction();
  try {
    if (!user.roleIds.includes(1) && !user.roleIds.includes(3)) {
      throw new APIError("Você não tem permissão para criar planos de aula.", httpStatus.UNAUTHORIZED);
    }

    const newClassPlan = await Class_Plan.create({
      active,
      title,
      AreaId,
      SubjectId,
      LevelId,
      GradeId,
      CourseId
    }, { transaction: t });

    if (!newClassPlan) {
      throw new APIError("Houve um erro ao criar o ano.");
    }

    await t.commit();

    return res.json({
      success: true,
      message: 'Plano de Aula criado com sucesso!'
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
 * Update existing classPlan
 * @returns {ClassPlan}
 */
const update = async (req, res, next) => {
  const { active, title, AreaId, SubjectId, LevelId, GradeId, CourseId } = req.body;
  const { classPlan, user } = req;

  const u = await sequelize.transaction();
  try {
    if (!user.roleIds.includes(1) && !user.roleIds.includes(3)) {
      throw new APIError("Você não possui permissão para atualizar isto.");
    }

    const updatedClassPlan = await classPlan.update({
      active,
      title,
      AreaId,
      SubjectId,
      LevelId,
      GradeId,
      CourseId
    }, { transaction: u });

    if (!updatedClassPlan) {
      throw new APIError("Houve um erro ao atualizar o plano de aula.");
    }

    u.commit();

    return res.json({
      success: true,
      message: "Plano de Aula atualizado com sucesso!"
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
 * Get classPlan list.
 * @returns {ClassPlan[]}
 */
const list = async (req, res, next) => {
  const { limit = 20, page = 1, active = true, AreaId, SubjectId, LevelId, GradeId, CourseId } = req.query;
  const offset = 0 + (parseInt(page) - 1) * limit;
  const { user } = req;

  try {
    let where = {
      active
    }

    if (user.roleIds.includes(1) || user.roleIds.includes(3)) {
      if (!!AreaId) {
        where = {...where, AreaId}
      }
      if (!!SubjectId) {
        where = {...where, SubjectId}
      }
      if (!!LevelId) {
        where = {...where, LevelId}
      }
      if (!!GradeId) {
        where = {...where, GradeId}
      }
      if (!!CourseId) {
        where = {...where, CourseId}
      }
    }

    if (user.roleIds.includes(4)) {
      const userAreas = await User_Area.findAll({
        where: {
          UserId: user.id
        },
        raw: true
      })

      let areas = []
      userAreas.forEach(row => {
        areas.push(row.AreaId)
      })

      where = {
        ...where,
        AreaId: areas
      }
    }

    console.log(where)

    const classPlans = await Class_Plan.findAndCountAll({
      where,
      include: [
        {
          model: Area,
          attributes: ['id', 'title']
        },
        {
          model: Level,
          attributes: ['id', 'title']
        },
        {
          model: Grade,
          attributes: ['id', 'title']
        },
        {
          model: Subject,
          attributes: ['id', 'title']
        },
        {
          model: Course,
          attributes: ['id', 'title']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    if (!classPlans) {
      throw new APIError("Não foi possível trazer a lista de planos de aula.");
    }

    return res.json({
      success: true,
      data: classPlans.rows,
      pagination: {
        limit,
        offset,
        page: parseInt(page),
        count: classPlans.count,
        nextPage: offset + limit <= classPlans.count
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
  const { user, classPlan } = req;

  const t = await sequelize.transaction();
  try {
    if (!user.roleIds.includes(1) && !user.roleIds.includes(3)) {
      throw new APIError("Você não possui permissão para excluir este plano de aula.");
    }

    const deletedClassPlan = await classPlan.destroy({ transaction: t });

    if (!deletedClassPlan) {
      throw new APIError("Houve um erro ao excluir o plano de aula.");
    }

    t.commit();

    return res.json({
      success: true,
      message: "Plano de aula excluído com sucesso!"
    });
  } catch (err) {
    t.rollback();
    return res.status(err.status ? err.status : 500).json({
      success: false,
      message: err.message,
      status: err.status ? err.status : 500
    })
  }
}

const createClassPlanImageUpload = async (req, res, next) => {
  const { file, user, classPlan } = req;

  const t = await sequelize.transaction();
  try {
    if (!user.roleIds.includes(1) && !user.roleIds.includes(3)) {
      throw new APIError("Você não possui permissão para atualizar isto.", httpStatus.UNAUTHORIZED);
    }

    const filename = Date.now() + '_' + replaceSpecialChars(path.basename(file.originalname)) + path.extname(file.originalname);
    const filePath = 'static/files/classplans/' + filename

    fs.ensureDir((process.env.NODE_ENV === 'production' ? '/var/www/api.teachlearn.com.br/' : '') + path.dirname(filePath), { mode: 0o2775 }, (err) => {
      if (err) throw new APIError("Erro ao gerar pastas para salvar arquivo.");
      writeFile((process.env.NODE_ENV === 'production' ? '/var/www/api.teachlearn.com.br/' : '') + filePath, file.buffer, (err) => {
        if (err) {
          throw new APIError("Erro ao gravar arquivo.");
        }
      })
    });

    const updatedClassPlan = await classPlan.update({
      photo: (process.env.NODE_ENV === 'production' ? 'https' : req.protocol) + '://' + req.get('host') + '/' + filePath
    }, { transaction: t });

    if (!updatedClassPlan) {
      throw new APIError("Houve um erro ao atualizar a foto do plano de aula.");
    }

    t.commit();

    return res.json({
      success: true,
      url_storage: updatedClassPlan.photo,
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

const listContents = async (req, res, next) => {
  const { limit = 20, page = 1, ClassPlanId } = req.query;
  const offset = 0 + (parseInt(page) - 1) * limit;

  try {
    if(!ClassPlanId) {
      throw new APIError("ClassPlanId é obrigatório.");
    }

    const classPlanContents = await Class_Plan_Content.findAndCountAll({
      where: {
        ClassPlanId
      },
      include: [
        {
          model: Class_Plan_Content_Page
        }
      ],
      order: [['title', 'ASC']],
      limit,
      offset
    });

    if (!classPlanContents) {
      throw new APIError("Não foi possível trazer a lista de conteúdos de planos de aula.");
    }

    return res.json({
      success: true,
      data: classPlanContents.rows,
      pagination: {
        limit,
        offset,
        page: parseInt(page),
        count: classPlanContents.count,
        nextPage: offset + limit <= classPlanContents.count
      }
    })

  } catch (err) {
    return res.status(err.status || 500).json({
      success: false,
      message: err.message,
      status: err.status || 500
    })
  }
}

const createContent = async (req, res, next) => {
  const { title, ClassPlanId } = req.body;
  const { user } = req;

  const t = await sequelize.transaction();
  try {
    if (!user.roleIds.includes(1) && !user.roleIds.includes(3)) {
      throw new APIError("Você não tem permissão para criar conteúdos de planos de aula.", httpStatus.UNAUTHORIZED);
    }

    const newClassPlanContent = await Class_Plan_Content.create({
      title,
      ClassPlanId
    }, { transaction: t });

    if (!newClassPlanContent) {
      throw new APIError("Houve um erro ao criar o Conteúdo de Plano de Aula.");
    }

    await t.commit();

    return res.json({
      success: true,
      message: 'Conteúdo de Plano de Aula criado com sucesso!'
    })
  } catch (err) {
    await t.rollback();
    return res.status(err.status || 500).json({
      success: false,
      message: err.message,
      status: err.status || 500
    })
  }
}

const getContent = async (req, res, next) => {
  const { classPlanContentId } = req.params
  const { user } = req

  try {
    if (user.roleIds.includes(5)) {
      throw new APIError("Você não tem permissão para acessar este local");
    }

    const classPlanContent = await Class_Plan_Content.findOne({
      where: { id: classPlanContentId },
      include: [
        {
          model: Class_Plan_Content_Page
        }
      ]
    })

    if (!classPlanContent) {
      throw new APIError("Este Conteúdo de Plano de aula não existe.");
    }

    return res.json({
      data: classPlanContent,
      success: true,
      message: ""
    });
  } catch (err) {
    return res.status(err.status || 500).json({
      success: false,
      message: err.message,
      status: err.status || 500
    })
  }
}

const updateclassPlanContent = async (req, res, next) => {
  const { title } = req.body;
  const { classPlanContentId } = req.params;
  const { user } = req;

  const u = await sequelize.transaction();
  try {
    if (!user.roleIds.includes(1) && !user.roleIds.includes(3)) {
      throw new APIError("Você não possui permissão para atualizar ano.");
    }

    const classPlanContent = await Class_Plan_Content.findOne({
      where: {
        id: classPlanContentId
      }
    })

    if (!classPlanContent) {
      throw new APIError("Conteúdo do plano de aula não encontrado.");
    }

    const updatedClassPlanContent = await classPlanContent.update({
      title
    }, { transaction: u });

    if (!updatedClassPlanContent) {
      throw new APIError("Houve um erro ao atualizar o conteudo plano de aula.");
    }

    u.commit();

    return res.json({
      success: true,
      message: "Conteúdo de Plano de Aula atualizado com sucesso!"
    });
  } catch (err) {
    u.rollback();
    return res.status(err.status || 500).json({
      success: false,
      message: err.message,
      status: err.status || 500
    })
  }
}

const removeContent = async (req, res, next) => {
  const { classPlanContentId } = req.params;
  const { user } = req;

  const u = await sequelize.transaction();
  try {
    if (!user.roleIds.includes(1) && !user.roleIds.includes(3)) {
      throw new APIError("Você não possui permissão para excluir conteúdo do plano de aula.");
    }

    const classPlanContent = await Class_Plan_Content.findOne({
      where: {
        id: classPlanContentId
      }
    })

    const deletedClassPlan = await classPlanContent.destroy({ transaction: u });

    if (!deletedClassPlan) {
      throw new APIError("Houve um erro ao excluir o conteúdo do plano de aula.");
    }

    await u.commit();

    return res.json({
      success: true,
      message: "Conteúdo Plano de aula excluído com sucesso!"
    });
  } catch (err) {
    await u.rollback();
    return res.status(err.status || 500).json({
      success: false,
      message: err.message,
      status: err.status || 500
    })
  }
}

const listContentPages = async (req, res, next) => {
  const { limit = 20, page = 1, ClassPlanContentId } = req.query;
  const offset = 0 + (parseInt(page) - 1) * limit;

  try {
    if(!ClassPlanContentId) {
      throw new APIError("ClassPlanContentId é obrigatório.");
    }

    const classPlanContentPages = await Class_Plan_Content_Page.findAndCountAll({
      where: {
        ClassPlanContentId
      },
      order: [['title', 'ASC']],
      limit,
      offset
    });

    if (!classPlanContentPages) {
      throw new APIError("Não foi possível trazer a lista de conteúdos de planos de aula.");
    }

    return res.json({
      success: true,
      data: classPlanContentPages.rows,
      pagination: {
        limit,
        offset,
        page: parseInt(page),
        count: classPlanContentPages.count,
        nextPage: offset + limit <= classPlanContentPages.count
      }
    })
  } catch (err) {
    return res.status(err.status || 500).json({
      success: false,
      message: err.message,
      status: err.status || 500
    })
  }
}

const createContentPage = async (req, res, next) => {
  const { title, active, ClassPlanContentId } = req.body;
  const { user } = req;

  const t = await sequelize.transaction();
  try {
    if (!user.roleIds.includes(1) && !user.roleIds.includes(3)) {
      throw new APIError("Você não tem permissão para criar páginas de conteúdos de planos de aula.", httpStatus.UNAUTHORIZED);
    }

    const newClassPlanContentPage = await Class_Plan_Content_Page.create({
      title,
      active,
      ClassPlanContentId
    }, { transaction: t });

    if (!newClassPlanContentPage) {
      throw new APIError("Houve um erro ao criar o Página de Conteúdo de Plano de Aula.");
    }

    await t.commit();

    return res.json({
      success: true,
      message: 'Página de Conteúdo de Plano de Aula criado com sucesso!'
    })
  } catch (err) {
    await t.rollback();
    return res.status(err.status || 500).json({
      success: false,
      message: err.message,
      status: err.status || 500
    })
  }
}

const getContentPage = async (req, res, next) => {
  const { classPlanContentPageId } = req.params
  const { user } = req

  try {
    if (user.roleIds.includes(5)) {
      throw new APIError("Você não tem permissão para acessar este local");
    }

    const classPlanContentPage = await Class_Plan_Content_Page.findOne({
      where: { id: classPlanContentPageId }
    })

    if (!classPlanContentPage) {
      throw new APIError("Este Conteúdo de Plano de aula não existe.");
    }

    return res.json({
      data: classPlanContentPage,
      success: true,
      message: ""
    });
  } catch (err) {
    return res.status(err.status || 500).json({
      success: false,
      message: err.message,
      status: err.status || 500
    })
  }
}

const updateclassPlanContentPage = async (req, res, next) => {
  const { title, active } = req.body;
  const { classPlanContentPageId } = req.params;
  const { user } = req;

  const u = await sequelize.transaction();
  try {
    if (!user.roleIds.includes(1) && !user.roleIds.includes(3)) {
      throw new APIError("Você não possui permissão para atualizar isto.");
    }

    const classPlanContentPage = await Class_Plan_Content_Page.findOne({
      where: {
        id: classPlanContentPageId
      }
    })

    if (!classPlanContentPage) {
      throw new APIError("Página de Conteúdo do plano de aula não encontrado.");
    }

    const updatedClassPlanContentPage = await classPlanContentPage.update({
      title,
      active
    }, { transaction: u });

    if (!updatedClassPlanContentPage) {
      throw new APIError("Houve um erro ao atualizar o Página de conteúdo plano de aula.");
    }

    u.commit();

    return res.json({
      success: true,
      message: "Página de Conteúdo de Plano de Aula atualizado com sucesso!"
    });
  } catch (err) {
    u.rollback();
    return res.status(err.status || 500).json({
      success: false,
      message: err.message,
      status: err.status || 500
    })
  }
}

const removeContentPage = async (req, res, next) => {
  const { classPlanContentPageId } = req.params;
  const { user } = req;

  const u = await sequelize.transaction();
  try {
    if (!user.roleIds.includes(1) && !user.roleIds.includes(3)) {
      throw new APIError("Você não possui permissão para excluir isto.");
    }

    const classPlanContentPage = await Class_Plan_Content_Page.findOne({
      where: {
        id: classPlanContentPageId
      }
    })

    const deletedClassPlanContentPage = await classPlanContentPage.destroy({ transaction: u });

    if (!deletedClassPlanContentPage) {
      throw new APIError("Houve um erro ao excluir isto.");
    }

    await u.commit();

    return res.json({
      success: true,
      message: "Página de Conteúdo Plano de aula excluído com sucesso!"
    });
  } catch (err) {
    await u.rollback();
    return res.status(err.status || 500).json({
      success: false,
      message: err.message,
      status: err.status || 500
    })
  }
}

const listContentPageItems = async (req, res, next) => {
  const { limit = 20, page = 1, ClassPlanContentPageId } = req.query;
  const offset = 0 + (parseInt(page) - 1) * limit;
  const { user } = req;

  try {
    if(!ClassPlanContentPageId) {
      throw new APIError("ClassPlanContentPageId é obrigatório.");
    }

    const classPlanContentPageItems = await Class_Plan_Content_Page_Item.findAndCountAll({
      where: {
        ClassPlanContentPageId
      },
      order: [['createdAt', 'ASC']],
      limit,
      offset
    });

    if (!classPlanContentPageItems) {
      throw new APIError("Não foi possível trazer a lista.");
    }

    return res.json({
      success: true,
      data: classPlanContentPageItems.rows,
      pagination: {
        limit,
        offset,
        page: parseInt(page),
        count: classPlanContentPageItems.count,
        nextPage: offset + limit <= classPlanContentPageItems.count
      }
    })

  } catch (err) {
    return res.status(err.status || 500).json({
      success: false,
      message: err.message,
      status: err.status || 500
    })
  }
}

const createContentPageItem = async (req, res, next) => {
  const { title, active, content, ClassPlanContentPageId, url_video, source_video} = req.body;
  const { user } = req;

  const t = await sequelize.transaction();
  try {
    if (!user.roleIds.includes(1) && !user.roleIds.includes(3)) {
      throw new APIError("Você não tem permissão para criar isto.", httpStatus.UNAUTHORIZED);
    }

    const newClassPlanContentPageItem = await Class_Plan_Content_Page_Item.create({
      title,
      active,
      content,
      ClassPlanContentPageId,
      url_video,
      source_video
    }, { transaction: t });

    if (!newClassPlanContentPageItem) {
      throw new APIError("Houve um erro ao criar.");
    }

    await t.commit();

    return res.json({
      success: true,
      message: 'Item de Página de Conteúdo de Plano de Aula criado com sucesso!'
    })
  } catch (err) {
    await t.rollback();
    return res.status(err.status || 500).json({
      success: false,
      message: err.message,
      status: err.status || 500
    })
  }
}

const getContentPageItem = async (req, res, next) => {
  const { classPlanContentPageItemId } = req.params
  const { user } = req

  try {
    if (user.roleIds.includes(5)) {
      throw new APIError("Você não tem permissão para acessar este local");
    }

    const getClassPlanContentPageItemAnnotation = await Class_Plan_Content_Page_Item_Annotation.findOrCreate({
      where: {
        ClassPlanContentPageItemId: classPlanContentPageItemId,
        UserId: user.id
      },
      defaults: {
        content: ''
      }
    })

    if (!getClassPlanContentPageItemAnnotation) {
      throw new APIError("Houve um erro na criação da caixa de anotação deste item.")
    }

    const classPlanContentPageItem = await Class_Plan_Content_Page_Item.findOne({
      where: { id: classPlanContentPageItemId },
      include: [
        {
          model: Class_Plan_Content_Page_Item_Annotation,
          where: {
            UserId: user.id
          },
          attributes: ['id', 'content']
          // attributes: {
          //   exclude: ['createdAt', 'updatedAt']
          // }
        }
      ]
    })

    if (!classPlanContentPageItem) {
      throw new APIError("Este Item de Página de Conteúdo de Plano de aula não existe.");
    }

    return res.json({
      data: classPlanContentPageItem,
      success: true,
      message: ""
    });
  } catch (err) {
    return res.status(err.status || 500).json({
      success: false,
      message: err.message,
      status: err.status || 500
    })
  }
}

const updateclassPlanContentPageItem = async (req, res, next) => {
  const { title, active, content, url_video, source_video } = req.body;
  const { classPlanContentPageItemId } = req.params;
  const { user } = req;

  const u = await sequelize.transaction();
  try {
    if (!user.roleIds.includes(1) && !user.roleIds.includes(3)) {
      throw new APIError("Você não possui permissão para atualizar isto.");
    }

    const classPlanContentPageItem = await Class_Plan_Content_Page_Item.findOne({
      where: {
        id: classPlanContentPageItemId
      }
    })

    if (!classPlanContentPageItem) {
      throw new APIError("Página de Conteúdo do plano de aula não encontrado.");
    }

    const updatedClassPlanContentPageItem = await classPlanContentPageItem.update({
      title,
      active,
      content,
      url_video,
      source_video
    }, { transaction: u });

    if (!updatedClassPlanContentPageItem) {
      throw new APIError("Houve um erro ao atualizar o Item de Página de conteúdo plano de aula.");
    }

    u.commit();

    return res.json({
      success: true,
      message: "Item de Página de Conteúdo de Plano de Aula atualizado com sucesso!"
    });
  } catch (err) {
    u.rollback();
    return res.status(err.status || 500).json({
      success: false,
      message: err.message,
      status: err.status || 500
    })
  }
}

const removeContentPageItem = async (req, res, next) => {
  const { classPlanContentPageItemId } = req.params;
  const { user } = req;

  const u = await sequelize.transaction();
  try {
    if (!user.roleIds.includes(1) && !user.roleIds.includes(3)) {
      throw new APIError("Você não possui permissão para excluir isto.");
    }

    const classPlanContentPageItem = await Class_Plan_Content_Page_Item.findOne({
      where: {
        id: classPlanContentPageItemId
      }
    })

    const deletedClassPlanContentPageItem = await classPlanContentPageItem.destroy({ transaction: u });

    if (!deletedClassPlanContentPageItem) {
      throw new APIError("Houve um erro ao excluir isto.");
    }

    await u.commit();

    return res.json({
      success: true,
      message: "Página de Conteúdo Plano de aula excluído com sucesso!"
    });
  } catch (err) {
    await u.rollback();
    return res.status(err.status || 500).json({
      success: false,
      message: err.message,
      status: err.status || 500
    })
  }
}

const addClassPlanContentPageItemAnnotation = async (req, res, next) => {
  const { content } = req.body;
  const { classPlanContentPageItemAnnotationId } = req.params;
  const { user } = req;

  const t = await sequelize.transaction();
  try {
    const classPlanContentPageItemAnnotation = await Class_Plan_Content_Page_Item_Annotation.findOne({
      where: {
        ClassPlanContentPageItemId: classPlanContentPageItemAnnotationId,
        UserId: user.id
      }
    })

    if (!classPlanContentPageItemAnnotation) {
      throw new APIError("Item não encontrado.", httpStatus.NOT_FOUND)
    }

    const udatedclassPlanContentPageItemAnnotation = await classPlanContentPageItemAnnotation.update({
      content
    }, { transaction: t });

    if (!udatedclassPlanContentPageItemAnnotation) {
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

const duplicate = async (req, res, next) => {
  const { user, classPlan } = req;

  // const t = await sequelize.transaction();
  try {
    if (!user.roleIds.includes(1) && !user.roleIds.includes(3)) {
      throw new APIError("Você não possui permissão para duplicar isto.");
    }

    const classPlanContents = await Class_Plan_Content.findAll({
      where: {
        ClassPlanId: classPlan.id
      },
      include: [
        {
          model: Class_Plan_Content_Page,
          include: [
            {
              model: Class_Plan_Content_Page_Item
            }
          ]
        }
      ]
    })

    const duplicatedClassPlan = await Class_Plan.create({
      active: classPlan.active,
      title: classPlan.title,
      photo: classPlan.photo,
      AreaId: classPlan.AreaId,
      SubjectId: classPlan.SubjectId,
      LevelId: classPlan.LevelId,
      GradeId: classPlan.GradeId,
      CourseId: classPlan.CourseId,
    })

    if (!duplicatedClassPlan) {
      throw new APIError("Houve um erro na criação do plano de aula.");
    }

    classPlanContents.forEach(async (content) => {
      const duplicatedClassPlanContent = await Class_Plan_Content.create({
        title: content.title,
        ClassPlanId: duplicatedClassPlan.id
      })

      if (!classPlanContents) {
        throw new APIError("Houve um erro na criação do conteúdo.");
      }

      content.Class_Plan_Content_Pages.forEach(async (page) => {
        const duplicatedClassPlanContentPage = await Class_Plan_Content_Page.create({
          active: page.active,
          title: page.title,
          ClassPlanContentId: duplicatedClassPlanContent.id
        })

        if (!duplicatedClassPlanContentPage) {
          throw new APIError("Houve um erro na criação da página.");
        }

        page.Class_Plan_Content_Page_Items.forEach(async (item) => {
          const duplicatedClassPlanContentPageItem = await Class_Plan_Content_Page_Item.create({
            active: item.active,
            title: item.title,
            ClassPlanContentPageId: duplicatedClassPlanContentPage.id,
            content: item.content,
            url_video: item.url_video,
            source_video: item.source_video
          })

          if (!duplicatedClassPlanContentPageItem) {
            throw new APIError("Houve um erro na criação do item.");
          }
        })
      })
    })

    return res.json({
      data: duplicatedClassPlan.id,
      success: true,
      message: ''
    })
  } catch (err) {
    // t.rollback();
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
  listContents,
  createContent,
  getContent,
  updateclassPlanContent,
  removeContent,
  listContentPages,
  createContentPage,
  getContentPage,
  updateclassPlanContentPage,
  removeContentPage,
  listContentPageItems,
  createContentPageItem,
  getContentPageItem,
  updateclassPlanContentPageItem,
  removeContentPageItem,
  createClassPlanImageUpload,
  addClassPlanContentPageItemAnnotation,
  duplicate
};
