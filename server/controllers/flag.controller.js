import db from '../models';
import APIError from '../helpers/APIError';
import { Op } from 'sequelize';

const {
  Flag,
  Question_Database_Flag,
  sequelize
} = db;

const list = async (req, res, next) => {
  const { user } = req;
  const { limit = 20, page = 1, text = null } = req.query;
  const offset = 0 + (parseInt(page) - 1) * limit;
  try {
    if(!user.roleIds.includes(1) && !user.roleIds.includes(3))
      throw new APIError("Você não possui permissão para acessar este local.");

    if (text !== null) {
      return searchLike(req, res, next)
    }

    const foundFlags = await Flag.findAndCountAll({
      attributes: ['id', 'title', 'fixed'],
      limit,
      offset
    })
    if(!foundFlags)
      throw new APIError("Houve um problema ao tentar listar flags para as questões do banco.");

    return res.json({
      success: true,
      data: foundFlags.rows,
      pagination: {
        limit,
        offset,
        page: parseInt(page),
        count: foundFlags.count,
        nextPage: offset + limit <= foundFlags.count
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
    if(!user.roleIds.includes(1))
      throw new APIError("Você não possui permissão para criar flags de questões.");

    const foundFlag = await Flag.findOne({
      where: { title },
      attributes: ['id']
    })
    if(foundFlag)
      throw new APIError("Esta flag já existe.");

    const createFlag = await Flag.create({
      title,
      fixed: false
    }, {transaction: t})
    if(!createFlag)
      throw new APIError("Houve um erro ao criar flag.");

    await t.commit();
    return res.json({
      success: true,
      data: createFlag,
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
  const { flagId } = req.params;
  try {
    if(!user.roleIds.includes(1) && !user.roleIds.includes(3))
      throw new APIError("Você não possui permissão para visualizar esta flag de questão.");

    const foundFlag = await Flag.findByPk(flagId)
    if(!foundFlag)
      throw new APIError("Flag não encontada.");

    return res.json({
      success: true,
      data: foundFlag,
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
  const { flagId } = req.params;
  const u = await sequelize.transaction();
  try {
    if(!user.roleIds.includes(1) && !user.roleIds.includes(3))
      throw new APIError("Você não possui permissão para atualizar flags de questões.");

    const foundFlag = await Flag.findOne({
      where: {title},
      attributes: ['id']
    })
    if(foundFlag)
      throw new APIError("Esta flag já existe.");

    const oldFlag = await Flag.findByPk(flagId);
    if(!oldFlag)
      throw new APIError("Tag não foi encontrada.");

    if(oldFlag.fixed)
      throw new APIError("Esta flag não pode ser editada.");

    const updateFlag = await oldFlag.update({
      title
    }, {transaction: u})
    if(!updateFlag)
      throw new APIError("Houve um erro ao atualizar flag.");

    await u.commit();
    return res.json({
      success: true,
      data: updateFlag,
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
  const { flagId } = req.params;
  const d = await sequelize.transaction();
  try {
    if(!user.roleIds.includes(1))
      throw new APIError("Você não possui permissão para remover flags de questões.");

    const oldFlag = await Flag.findByPk(flagId);
    if(!oldFlag)
      throw new APIError("Flag não foi enconrada.");

    if(oldFlag.fixed) 
      throw new APIError("Esta flag não pode ser removida.");

    const deletedFlag = await oldFlag.destroy({transaction: d});
    if(!deletedFlag)
      throw new APIError("Houve um erro ao remover flag.");

    await d.commit();
    return res.json({
      success: true,
      message: "Flag removida com sucesso!",
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
    if(!user.roleIds.includes(1) && !user.roleIds.includes(3))
      throw new APIError("Você não possui permissão para visualizar esta listagem de flags de questões.");
    
    const FoundFlags = await Flag.findAll({
      where: {
        title: {[Op.iLike]: "%" + text }
      }
    });
    if(!FoundFlags)
      throw new APIError("Houve um erro ao tentar listar flags.");

    return res.json({
      success: true,
      data: FoundFlags,
    })
  } catch(err) {
    return res.status(err.status ? err.status : 500).json({
      success: false,
      message: err.message
    })
  }
}

const includeFlagOnQuestion = async (req, res, next) => {
  const { user } = req;
  const { flagId, questionId } = req.params;
  const t = await sequelize.transaction();
  try {
    if(!user.roleIds.includes(1) && !user.roleIds.includes(3))
      throw new APIError("Você não possui permissão para incluir tags em questões.");

    const foundQuestionFlag = await Question_Database_Flag.findOne({
      where: {
        FlagId: flagId,
        QuestionDatabaseId: questionId
      },
      attributes: ['id']
    })
    if(foundQuestionFlag)
      throw new APIError("Esta flag já está registrada nesta questão.");

    const createdQuestionFlag = await Question_Database_Flag.create({
      FlagId: flagId,
      QuestionDatabaseId: questionId
    }, {transaction: t})
    if(!createdQuestionFlag)
      throw new APIError("Houve um erro ao registrar flag à questão.");

    await t.commit();
    return res.json({
      success: true,
      message: "Flag registrada com sucesso!"
    })
  } catch(err) {
    await t.rollback();
    return res.status(err.status ? err.status : 500).json({
      success: false,
      message: err.message
    })
  }
}

const removeFlagOnQuestion = async (req, res, next) => {
  const { user } = req;
  const { questionFlagId } = req.params;
  const d = await sequelize.transaction();
  try {
    if(!user.roleIds.includes(1) && !user.roleIds.includes(3))
      throw new APIError("Você não possui permissão para visualizar esta listagem de flags de questões.");

    const foundQuestionFlag = await Question_Database_Flag.findOne({
      where: {id: questionFlagId},
      attributes: ['id']
    })
    if(!foundQuestionFlag)
      throw new APIError("Esta flag não foi encotrada na questão.");
    
    const deletedQuestionFlag = await foundQuestionFlag.destroy({transaction: d});
    if(!deletedQuestionFlag)
      throw new APIError("Houve um erro ao retirar a flag da questão.");

    await d.commit();
    return res.json({
      success: true,
      message: "Flag retirada com sucesso!"
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
  list, create, get, update, remove, searchLike, includeFlagOnQuestion, removeFlagOnQuestion
};