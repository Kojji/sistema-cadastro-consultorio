import db from '../models';
import APIError from '../helpers/APIError';
import { Op } from 'sequelize';

const {
  Tag,
  Question_Database_Tag,
  sequelize
} = db;

const list = async (req, res, next) => {
  const { user } = req;
  const { limit = 20, page = 1, text = null } = req.query;
  const offset = 0 + (parseInt(page) - 1) * limit;
  try {
    if(!user.roleIds.includes(1) && !user.roleIds.includes(3) && !user.roleIds.includes(4))
      throw new APIError("Você não possui permissão para acessar este local.");

    if (text !== null) {
      return searchLike(req, res, next)
    }

    const foundTags = await Tag.findAndCountAll({
      attributes: ['id', 'title', 'createdAt'],
      limit,
      order: [['createdAt', 'DESC']],
      offset
    })
    if(!foundTags)
      throw new APIError("Houve um problema ao tentar listar tags para as questões do banco.");

    return res.json({
      success: true,
      data: foundTags.rows,
      pagination: {
        limit,
        offset,
        page: parseInt(page),
        count: foundTags.count,
        nextPage: offset + limit <= foundTags.count
      }
    })
  } catch(err) {
    return res.status(err.status ? err.status : 500).json({
      success: false,
      message: err.message
    })
  }
}

const create = async (req, res, next) => {
  const { user } = req;
  const { title } = req.body;
  const t = await sequelize.transaction();
  try {
    if(!user.roleIds.includes(1) && !user.roleIds.includes(3))
      throw new APIError("Você não possui permissão para criar tags de questões.");

    const foundTag = await Tag.findOne({
      where: {title},
      attributes: ['id']
    })
    if(foundTag)
      throw new APIError("Esta tag já existe.");

    const createTag = await Tag.create({
      title
    }, {transaction: t})
    if(!createTag)
      throw new APIError("Houve um erro ao criar tag.");

    await t.commit();
    return res.json({
      success: true,
      data: createTag,
    })
  } catch(err) {
    await t.rollback();
    return res.status(err.status ? err.status : 500).json({
      success: false,
      message: err.message
    })
  }
}

const get = async (req, res, next) => {
  const { user } = req;
  const { tagId } = req.params;
  try {
    if(!user.roleIds.includes(1) && !user.roleIds.includes(3) && !user.roleIds.includes(4))
      throw new APIError("Você não possui permissão para visualizar esta tag de questão.");

    const foundTag = await Tag.findByPk(tagId)
    if(!foundTag)
      throw new APIError("Tag não encontada.");

    return res.json({
      success: true,
      data: foundTag,
    })
  } catch(err) {
    return res.status(err.status ? err.status : 500).json({
      success: false,
      message: err.message
    })
  }
}

const update = async (req, res, next) => {
  const { user } = req;
  const { title } = req.body;
  const { tagId } = req.params;
  const u = await sequelize.transaction();
  try {
    if(!user.roleIds.includes(1) && !user.roleIds.includes(3))
      throw new APIError("Você não possui permissão para atualizar tags de questões.");

    const foundTag = await Tag.findOne({
      where: {title},
      attributes: ['id']
    })
    if(foundTag)
      throw new APIError("Esta tag já existe.");

    const oldTag = await Tag.findByPk(tagId);
    if(!oldTag)
      throw new APIError("Tag não foi encontrada.");

    const updateTag = await oldTag.update({
      title
    }, {transaction: u})
    if(!updateTag)
      throw new APIError("Houve um erro ao atualizar tag.");

    await u.commit();
    return res.json({
      success: true,
      data: updateTag,
    })
  } catch(err) {
    await u.rollback();
    return res.status(err.status ? err.status : 500).json({
      success: false,
      message: err.message
    })
  }
}

const remove = async (req, res, next) => {
  const { user } = req;
  const { tagId } = req.params;
  const d = await sequelize.transaction();
  try {
    if(!user.roleIds.includes(1) && !user.roleIds.includes(3))
      throw new APIError("Você não possui permissão para remover tags de questões.");

    const oldTag = await Tag.findByPk(tagId);
    if(!oldTag)
      throw new APIError("Tag não foi enconrada.");

    const deletedTag = await oldTag.destroy({transaction: d});
    if(!deletedTag)
      throw new APIError("Houve um erro ao remover tag.");

    await d.commit();
    return res.json({
      success: true,
      message: "Tag removida com sucesso!",
    })
  } catch(err) {
    await d.rollback();
    return res.status(err.status ? err.status : 500).json({
      success: false,
      message: err.message
    })
  }
}

const searchLike = async (req, res, next) => {
  const { user } = req;
  const { text = '' } = req.query;
  try {
    if(!user.roleIds.includes(1) && !user.roleIds.includes(3) && !user.roleIds.includes(4))
      throw new APIError("Você não possui permissão para visualizar esta listagem de tags de questões.");

    let search = text
    
    const FoundTags = await Tag.findAll({
      where: {
        title: {[Op.iLike]: "%" + search}
      },
      order: [['createdAt', 'DESC']],
    });
    if(!FoundTags)
      throw new APIError("Houve um erro ao tentar listar tags.");

    return res.json({
      success: true,
      data: FoundTags,
    })
  } catch(err) {
    return res.status(err.status ? err.status : 500).json({
      success: false,
      message: err.message
    })
  }
}

const includeTagOnQuestion = async (req, res, next) => {
  const { user } = req;
  const { tagId, questionId } = req.params;
  const t = await sequelize.transaction();
  try {
    if(!user.roleIds.includes(1) && !user.roleIds.includes(3))
      throw new APIError("Você não possui permissão para incluir tags em questões.");

    const foundQuestionTag = await Question_Database_Tag.findOne({
      where: {
        TagId: tagId,
        QuestionDatabaseId: questionId
      },
      attributes: ['id']
    })
    if(foundQuestionTag)
      throw new APIError("Esta tag já está registrada nesta questão.");

    const createdQuestionTag = await Question_Database_Tag.create({
      TagId: tagId,
      QuestionDatabaseId: questionId
    }, {transaction: t})
    if(!createdQuestionTag)
      throw new APIError("Houve um erro ao registrar tag à questão.");

    await t.commit();
    return res.json({
      success: true,
      message: "Tag registrada com sucesso!"
    })
  } catch(err) {
    await t.rollback();
    return res.status(err.status ? err.status : 500).json({
      success: false,
      message: err.message
    })
  }
}

const removeTagOnQuestion = async (req, res, next) => {
  const { user } = req;
  const { questionTagId } = req.params;
  const d = await sequelize.transaction();
  try {
    if(!user.roleIds.includes(1) && !user.roleIds.includes(3))
      throw new APIError("Você não possui permissão para visualizar esta listagem de tags de questões.");

    const foundQuestionTag = await Question_Database_Tag.findOne({
      where: {id: questionTagId},
      attributes: ['id']
    })
    if(!foundQuestionTag)
      throw new APIError("Esta tag não foi encotrada na questão.");
    
    const deletedQuestionTag = await foundQuestionTag.destroy({transaction: d});
    if(!deletedQuestionTag)
      throw new APIError("Houve um erro ao retirar a tag da questão.");

    await d.commit();
    return res.json({
      success: true,
      message: "Tag retirada com sucesso!"
    })
  } catch(err) {
    await d.rollback();
    return res.status(err.status ? err.status : 500).json({
      success: false,
      message: err.message
    })
  }
}

export default {
  list, create, get, update, remove, searchLike, includeTagOnQuestion, removeTagOnQuestion
};