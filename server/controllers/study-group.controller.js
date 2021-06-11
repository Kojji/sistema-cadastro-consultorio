import httpStatus from 'http-status';
import db from '../models';
import { Op } from 'sequelize';
import APIError from '../helpers/APIError';
import crypto from "crypto-js";

const {
  User,
  File,
  Study_Group,
  Study_Group_User,
  Study_Group_Share,
  Study_Group_Message,
  sequelize
} = db;

const createGroup = async (req, res, next) => {
  const { user } = req;
  const { title, description=null } = req.body;
  const t = await sequelize.transaction();
  const createDOMPurify = require('dompurify');
  const { JSDOM } = require('jsdom');
  try {
    let normalized = '';
    if(!!description) {
      const window = new JSDOM('').window;
      const DOMPurify = createDOMPurify(window);
      normalized = DOMPurify.sanitize(description);
    }

    const hash = crypto.SHA3(user.schemaname + user.id + new Date(), { outputLength: 32 });

    const createdGroup = await Study_Group.create({
      title,
      description: normalized,
      active: true,
      code: hash.toString(),
      access_code: hash.toString()
    }, {transaction: t})
    if(!createdGroup)
      throw new APIError("Houve um erro ao tentar cria grupo de estudos.");

    const addedAdmin = await Study_Group_User.create({
      UserId: user.id,
      notes: "",
      isAdmin: true,
      online: false,
      StudyGroupId: createdGroup.id,
      unread_mesages: 0,
      active: true
    }, {transaction: t})
    if(!addedAdmin)
      throw new APIError("Houve um erro ao inserir usuário no grupo.");
    
    await t.commit();
    return res.json({
      success: true,
      message: "Grupo criado com sucesso!",
      data: createdGroup
    })
  } catch (err) {
    await t.rollback();
    return res.status(err.status ? err.status : 500).json({
      success: false,
      message: err.message,
      status: err.status ? err.status : 500
    })
  }
};

const getGroup = async (req, res, next) => {
  const { user } = req;
  const { groupId } = req.params;
  try {
    let limitMessages = 20;
    let limitShares = 10;
    const foundGroup = await Study_Group.findOne({
      where: {
        id: groupId
      },
      attributes: ['id','title','description', 'code', 'active']
    })
    if(!foundGroup)
      throw new APIError("Grupo não encontrado.");
    const foundUserGroup = await Study_Group_User.findOne({
      where: {
        UserId: user.id,
        StudyGroupId: groupId
      },
      attributes: ['id','active','notes', 'isAdmin']
    })
    if(!foundUserGroup)
      throw new APIError("Usuário não pertence ao grupo.");
    if(!foundUserGroup.active)
      throw new APIError("Usuário não pertence ao grupo.");

    await foundUserGroup.update({
      unread_messages: 0,
      online: true
    })

    const foundUsers = await Study_Group_User.findAll({
      where: {
        StudyGroupId: groupId,
        active: true
      },
      include: [{
        model: User,
        attributes: ['id', 'name', 'photo']
      }],
      attributes: ['isAdmin', 'online', 'createdAt']
    })
    if(!foundUsers)
      throw new APIError("Houve um erro ao listar usuários do grupo.");

    const foundMessages = await Study_Group_Message.findAll({
      where: {
        StudyGroupId: groupId
      },
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'photo']
        },
      ],
      attributes: {
        exclude:['UserId', 'updatedAt', 'StudyGroupId']
      },
      order: [['createdAt', 'DESC']],
      limit: limitMessages,
      offset: 0
    })
    if(!foundMessages)
      throw new APIError("Houve um erro ao tentar listar mensagens.");

    const foundShares = await Study_Group_Share.findAll({
      where: {
        StudyGroupId: groupId
      },
      include: [
        {
          model: File,
          attributes: ['id','name', 'type', 'path_storage', 'url_storage']
        },
        {
          model: User,
          attributes: ['id', 'name', 'photo']
        },
      ],
      attributes: {
        exclude:['UserId', 'FileId', 'updatedAt', 'StudyGroupId']
      },
      order: [['createdAt', 'DESC']],
      limit: limitShares,
      offset: 0
    })
    if(!foundShares)
      throw new APIError("Houve um erro ao tentar listar conteúdo compartilhado.");

    return res.json({
      success: true,
      group: foundGroup,
      users: foundUsers,
      notes: foundUserGroup.notes,
      isAdmin: foundUserGroup.isAdmin,
      messages: foundMessages.reverse(),
      shares: foundShares.reverse(),
      pagination_messages: {
        limit: limitMessages,
        offset: 0,
        page: 1,
        count: foundMessages.length,
        nextPage: 0 + limitMessages <= foundMessages.length
      },
      pagination_shares: {
        limit: limitShares,
        offset: 0,
        page: 1,
        count: foundShares.length,
        nextPage: 0 + limitShares <= foundShares.length
      }

    })
  } catch (err) {
    return res.status(err.status ? err.status : 500).json({
      success: false,
      message: err.message,
      status: err.status ? err.status : 500
    })
  }
}

const getGroupUsers = async (req, res, next) => {
  const { user } = req;
  const { groupId } = req.params;
  try {
    const foundUserGroup = await Study_Group_User.findOne({
      where: {
        UserId: user.id,
        StudyGroupId: groupId
      },
      attributes: ['id','active']
    })
    if(!foundUserGroup)
      throw new APIError("Usuário não pertence ao grupo.");
    if(!foundUserGroup.active)
      throw new APIError("Usuário não pertence ao grupo.");
    const foundUsers = await Study_Group_User.findAll({
      where: {
        StudyGroupId: groupId,
        active: true
      },
      include: [{
        model: User,
        attributes: ['id', 'name', 'photo']
      }],
      attributes: ['isAdmin', 'online', 'createdAt']
    })
    if(!foundUsers)
      throw new APIError("Houve um erro ao listar usuários do grupo.");

    return res.json({
      success: true,
      data: foundUsers
    })
  } catch (err) {
    return res.status(err.status ? err.status : 500).json({
      success: false,
      message: err.message,
      status: err.status ? err.status : 500
    })
  }
};

const editGroupInfo = async (req, res, next) => {
  const { user } = req;
  const { groupId } = req.params;
  const { title=null, description=null } = req.body;
  const createDOMPurify = require('dompurify');
  const { JSDOM } = require('jsdom');

  const u = await sequelize.transaction();
  try {
    const foundGroup = await Study_Group.findOne({
      where: {id: groupId},
      attributes: ["id", 'active']
    })
    if(!foundGroup)
      throw new APIError("Grupo de estudos não encontrado.");
    if(!foundGroup.active)
      throw new APIError("Grupo de estudos inativado.");

    const userAdmin = await Study_Group_User.findOne({
      where: {
        UserId: user.id,
        StudyGroupId: groupId
      },
      attributes: ["isAdmin"]
    })
    if(!userAdmin)
      throw new APIError("Usuário não pertence ao grupo.");
    if(!userAdmin.isAdmin)
      throw new APIError("Somente administradores podem editar informações do grupo.");

    let toUpdate = {}
    if(!!title) toUpdate = {...toUpdate, title}
    if(!!description) {
      let normalized = '';
      const window = new JSDOM('').window;
      const DOMPurify = createDOMPurify(window);
      normalized = DOMPurify.sanitize(description);
      toUpdate = {...toUpdate, description: normalized}
    }

    const updatedGroup = await foundGroup.update(
      toUpdate,
      {transaction: u}
    )
    if(!updatedGroup)
      throw new APIError("Houve um erro ao tentar atualizar informações do grupo.");

    await u.commit();
    return res.json({
      success: true,
      message: "Informações do grupo atualizadas com sucesso!",
      data: updatedGroup
    })
  } catch (err) {
    await u.rollback();
    return res.status(err.status ? err.status : 500).json({
      success: false,
      message: err.message,
      status: err.status ? err.status : 500
    })
  }
};

const listGroups = async (req, res, next) => {
  const { user } = req;
  const { limit = 20, page = 1 } = req.query;
  const offset = 0 + (parseInt(page) - 1) * limit;
  try {
    const listGroups = await Study_Group_User.findAll({
      where: {
        UserId: user.id
      },
      include: {
        model: Study_Group,
        attributes: ['id', 'title', 'description', 'active'],
        include: {
          model: Study_Group_User,
          where: {
            active: true
          },
          attributes: ['id'],
          include: [{
            model: User,
            attributes: ['id', 'name', 'photo']
          }],
        }
      },
      attributes: ['unread_messages', 'active', 'isAdmin', 'createdAt'],
      order:[["createdAt", "DESC"]],
      limit,
      offset
    })
    if(!listGroups)
      throw new APIError("Houve um erro ao tentar listar grupos.");

    return res.json({
      success: true,
      data: listGroups,
      pagination: {
        limit,
        offset,
        page: parseInt(page),
        count: listGroups.length,
        nextPage: offset + limit <= listGroups.length
      }
    })
  } catch (err) {
    return res.status(err.status ? err.status : 500).json({
      success: false,
      message: err.message
    })
  }
};

const removeGroupFromList = async (req, res, next) => {
  const { user } = req;
  const { groupId } = req.params;
  const d = await sequelize.transaction();
  try {
    const foundUserGroup = await Study_Group_User.findOne({
      where: {
        UserId: user.id,
        StudyGroupId: groupId
      },
      attributes: ['id', 'active']
    })
    if(!foundUserGroup)
      throw new APIError("Grupo já removido.");
    if(foundUserGroup.active)
      throw new APIError("Grupo só pode ser removido se o usuário não estiver mais nele.");

    const deletedUserGroup = await foundUserGroup.destroy({}, {transaction: d});
    if(!deletedUserGroup)
      throw new APIError("Houve um erro ao remover grupo.");

    await d.commit();
    return res.json({
      success: true,
      message: "Grupo removido com sucesso!"
    })
  } catch (err) {
    await d.rollback();
    return res.status(err.status ? err.status : 500).json({
      success: false,
      message: err.message,
      status: err.status ? err.status : 500
    })
  }
};

const addPersonToGroup = async (req, res, next) => {
  // admin adiciona pessoa no grupo, n será implementado já que o sistema n permite e n permitirá uma listagem pública de todos usuários
};

const removePersonFromGroup = async (req, res, next) => {
  const { user } = req;
  const { groupId, userId } = req.params;
  const u = await sequelize.transaction();
  try {
    const foundGroup = await Study_Group.findOne({
      where: {id: groupId},
      attributes: ['active']
    })
    if(!foundGroup)
      throw new APIError("Grupo de estudos não encontrado.");
    if(!foundGroup.active)
      throw new APIError("Grupo de estudos inativado.");
    const userAdmin = await Study_Group_User.findOne({
      where: {
        UserId: user.id,
        StudyGroupId: groupId
      },
      attributes: ["isAdmin"]
    })
    if(!userAdmin)
      throw new APIError("Usuário não pertence ao grupo.");
    if(!userAdmin.isAdmin)
      throw new APIError("Somente administradores podem remover usuários.");

    const toRemoveUser = await Study_Group_User.findOne({
      where: {
        UserId: userId,
        StudyGroupId: groupId,
        active: true
      }, attributes: ['id', 'isAdmin']
    })
    if(!toRemoveUser)
      throw new APIError("O usuário não se encontra no grupo.");
    if(toRemoveUser.isAdmin)
      throw new APIError("Administradores não podem ser removidos.");

    const removedUser = await toRemoveUser.update({
      unread_mesages: 0,
      active: false,
      online: false
    }, {transaction: u})
    if(!removedUser)
      throw new APIError("Houve um erro ao tentar remover usuário do grupo.");

    await u.commit();
    return res.json({
      success: true,
      message: "Usuário removido com sucesso!"
    })
  } catch (err) {
    await u.rollback();
    return res.status(err.status ? err.status : 500).json({
      success: false,
      message: err.message,
      status: err.status ? err.status : 500
    })
  }
};

const setAdminToGroup = async (req, res, next) => {
  const { user } = req;
  const { groupId } = req.params;
  const { userId } = req.body;
  const u = await sequelize.transaction();
  try {
    const foundGroup = await Study_Group.findOne({
      where: {id: groupId},
      attributes: ['active']
    })
    if(!foundGroup)
      throw new APIError("Grupo de estudos não encontrado.");
    if(!foundGroup.active)
      throw new APIError("Grupo de estudos inativado.");
    const userAdmin = await Study_Group_User.findOne({
      where: {
        UserId: user.id,
        StudyGroupId: groupId
      },
      attributes: ["isAdmin", "active"]
    })
    if(!userAdmin)
      throw new APIError("Usuário não pertence ao grupo.");
    if(!userAdmin.isAdmin)
      throw new APIError("Somente administradores podem modificar o código de acesso.");

    const newAdmin = await Study_Group_User.findOne({
      where: {
        UserId: userId,
        StudyGroupId: groupId
      },
      attributes: ["id", "active"]
    })
    if(!newAdmin)
      throw new APIError("Usuário não pertence ao grupo.");
    if(!newAdmin.active)
      throw new APIError("Somente usuários do grupo podem ser administreadores.");

    const updatedAdmin = await newAdmin.update({
      isAdmin: true
    }, {transaction: u})
    if(!updatedAdmin)
      throw new APIError("Houve um erro ao tentar adicionar administrador.");

    await u.commit();
    return res.json({
      success: true,
      message: "Novo administrador adicionado com sucesso!"
    })
  } catch (err) {
    await u.rollback();
    return res.status(err.status ? err.status : 500).json({
      success: false,
      message: err.message,
      status: err.status ? err.status : 500
    })
  }
};

const insertInGroup = async (req, res, next) => {
  const { user } = req;
  const { groupCode } = req.params;
  const t = await sequelize.transaction();
  try {
    const foundGroup = await Study_Group.findOne({
      where: {access_code: groupCode},
      attributes: ['id', 'active']
    })
    if(!foundGroup)
      throw new APIError("Código inválido.");
    if(!foundGroup.active)
      throw new APIError("Grupo de estudos foi inativado.");

    const userQuantity = await Study_Group_User.count({
      where: {
        StudyGroupId: foundGroup.id,
        active: true
      }
    })
    if(!userQuantity)
      throw new APIError("Houve um erro ao tentar verificar a quantidade de usuários no grupo.");

    if(userQuantity == 8)
      throw new APIError("Limite de usuários no grupo atingido.");

    const foundUserGroup = await Study_Group_User.findOne({
      where: {
        StudyGroupId: foundGroup.id,
        UserId: user.id
      }
    })
    if(foundUserGroup) {
      const updatedUser = await foundUserGroup.update({
        active: true
      }, {transaction: t})
      if(!updatedUser)
        throw new APIError("Houve um erro ao tentar inserir usuário ao grupo.");
    } else {
      const insertedUser = await Study_Group_User.create({
        UserId: user.id,
        notes: "",
        isAdmin: false,
        online: false,
        StudyGroupId: foundGroup.id,
        unread_mesages: 0,
        active: true
      }, {transaction: t})
      if(!insertedUser)
        throw new APIError("Houve um erro ao inserir usuário no grupo.");
    }

    await t.commit();
    return res.json({
      success: true,
      message: "Novo usuário adicionado com sucesso!"
    })
  } catch (err) {
    await t.rollback();
    return res.status(err.status ? err.status : 500).json({
      success: false,
      message: err.message,
      status: err.status ? err.status : 500
    })
  }
};

const exitGroup = async (req, res, next) => {
  const { user } = req;
  const { groupId } = req.params;
  const u = await sequelize.transaction();
  const t = await sequelize.transaction();
  try {
    const userGroup = await Study_Group_User.findOne({
      where: {
        UserId: user.id,
        StudyGroupId: groupId
      },
      attributes: ['id', 'active', 'isAdmin']
    })
    if(!userGroup)
      throw new APIError("Usuário não pertence ao grupo.");
    if(!userGroup.active)
      throw new APIError("Usuário não pertence ao grupo.");  

    if(userGroup.isAdmin) {
      const adminQuantity = await Study_Group_User.count({
        where: { 
          id: {[Op.not]: userGroup.id},
          isAdmin: true
        }
      })
      if(adminQuantity == 0) {
        const newAdmin = await Study_Group_User.findOne({
          where: {
            id: {[Op.not]: userGroup.id},                          
            StudyGroupId: groupId,
            active: true
          },
          attributes: ['id'],
          order: [['createdAt','ASC']]
        })
        if(!!newAdmin) {
          const updatedAdmin = await newAdmin.update({
            isAdmin: true
          }, {transaction: u})
          if(!updatedAdmin)
            throw new APIError("Erro ao definir novo administrador.");  
        }
      }
    }

    const removedUser = await userGroup.update({
      isAdmin: false,
      active: false,
      online: false,
    }, {transaction: t})
    if(!removedUser)
      throw new APIError("Houve um erro ao tentar remover usuário do grupo.");  

    await u.commit();
    await t.commit();
    return res.json({
      success: true,
      message: "Usuário saiu do grupo com sucesso!",
    })
  } catch (err) {
    await u.rollback();
    await t.rollback();
    return res.status(err.status ? err.status : 500).json({
      success: false,
      message: err.message,
      status: err.status ? err.status : 500
    })
  }
};

const changeGroupCode = async (req, res, next) => {
  const { user } = req;
  const { groupId } = req.params;
  const u = await sequelize.transaction();
  try {
    const foundGroup = await Study_Group.findOne({
      where: {id: groupId},
      attributes: ["id", 'active']
    })
    if(!foundGroup)
      throw new APIError("Grupo de estudos não encontrado.");
    if(!foundGroup.active)
      throw new APIError("Grupo de estudos inativado.");

    const userAdmin = await Study_Group_User.findOne({
      where: {
        UserId: user.id,
        StudyGroupId: groupId
      },
      attributes: ["isAdmin", "active"]
    })
    if(!userAdmin)
      throw new APIError("Usuário não pertence ao grupo.");
    if(!userAdmin.isAdmin)
      throw new APIError("Somente administradores podem modificar o código de acesso.");

    const hash = crypto.SHA3(user.schemaname + user.id + new Date(), { outputLength: 32 });

    const updatedCode = await foundGroup.update({
      access_code: hash.toString()
    }, {transaction: u})
    if(!updatedCode)
      throw new APIError("Houve um erro ao tentar modificar a chave de acesso do grupo.");

    await u.commit();
    return res.json({
      success: true,
      message: "Código atualizado com sucesso!",
      data: updatedCode
    })
  } catch (err) {
    await u.rollback();
    return res.status(err.status ? err.status : 500).json({
      success: false,
      message: err.message,
      status: err.status ? err.status : 500
    })
  }
};

const getGroupCode = async (req, res, next) => {
  const { user } = req;
  const { groupId } = req.params;
  try {
    const foundGroup = await Study_Group.findOne({
      where: {id: groupId},
      attributes: ["id", "access_code", "active"]
    })
    if(!foundGroup)
      throw new APIError("Grupo de estudos não encontrado.");
    if(!foundGroup.active)
      throw new APIError("Grupo de estudos inativado.");

    const userAdmin = await Study_Group_User.findOne({
      where: {
        UserId: user.id,
        StudyGroupId: groupId
      },
      attributes: ["isAdmin", "active"]
    })
    if(!userAdmin)
      throw new APIError("Usuário não pertence ao grupo.");
    if(!userAdmin.isAdmin)
      throw new APIError("Somente administradores podem modificar o código de acesso.");
    
    return res.json({
      success: true,
      data: foundGroup
    })
  } catch (err) {
    return res.status(err.status ? err.status : 500).json({
      success: false,
      message: err.message,
      status: err.status ? err.status : 500
    })
  }
};

const listMessages = async (req, res, next) => {
  const { user } = req;
  const { groupId } = req.params;
  const { limit = 20, page = 1 } = req.query;
  const offset = 0 + (parseInt(page) - 1) * limit;
  try {
    const foundUserGroup = await Study_Group_User.findOne({
      where: {
        UserId: user.id,
        StudyGroupId: groupId
      },
      attributes: ['id', 'active']
    })
    if(!foundUserGroup)
      throw new APIError("Usuário não pertence ao grupo.");
    if(!foundUserGroup.active)
      throw new APIError("Usuário não pertence ao grupo.");

    const foundMessages = await Study_Group_Message.findAndCountAll({
      where: {
        StudyGroupId: groupId
      },
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'photo']
        },
      ],
      attributes: {
        exclude:['UserId', 'updatedAt', 'StudyGroupId']
      },
      order: [['createdAt', 'DESC']],
      limit,
      offset
    })
    if(!foundMessages)
      throw new APIError("Houve um erro ao tentar listar mensagens.");

    await foundUserGroup.update({
      unread_messages: 0
    })
    return res.json({
      success: true,
      data: foundMessages.rows.reverse(),
      pagination: {
        limit,
        offset,
        page: parseInt(page),
        count: foundMessages.count,
        nextPage: offset + limit < foundMessages.count
      }
    })
  } catch (err) {
    return res.status(err.status ? err.status : 500).json({
      success: false,
      message: err.message,
      status: err.status ? err.status : 500
    })
  }
};

const listShares = async (req, res, next) => {
  const { user } = req;
  const { groupId } = req.params;
  const { limit = 10, page = 1 } = req.query;
  const offset = 0 + (parseInt(page) - 1) * limit;
  try {
    const foundUserGroup = await Study_Group_User.findOne({
      where: {
        UserId: user.id,
        StudyGroupId: groupId
      },
      attributes: ['active']
    })
    if(!foundUserGroup)
      throw new APIError("Usuário não pertence ao grupo.");
    if(!foundUserGroup.active)
      throw new APIError("Usuário não pertence ao grupo.");

    const foundShares = await Study_Group_Share.findAndCountAll({
      where: {
        StudyGroupId: groupId
      },
      include: [
        {
          model: File,
          attributes: ['id','name', 'type', 'path_storage', 'url_storage']
        },
        {
          model: User,
          attributes: ['id', 'name', 'photo']
        },
      ],
      attributes: {
        exclude:['UserId', 'FileId', 'updatedAt', 'StudyGroupId']
      },
      order: [['createdAt', 'DESC']],
      limit,
      offset
    })
    if(!foundShares)
      throw new APIError("Houve um erro ao tentar listar conteúdo compartilhado.");

    return res.json({
      success: true,
      data: foundShares.rows,
      pagination: {
        limit,
        offset,
        page: parseInt(page),
        count: foundShares.count,
        nextPage: offset + limit < foundShares.count
      }
    })
  } catch (err) {
    return res.status(err.status ? err.status : 500).json({
      success: false,
      message: err.message,
      status: err.status ? err.status : 500
    })
  }
};

const shareFiles = async (req, res, next) => {
  const { user } = req;
  const { groupId } = req.params;
  const { type,FileId=null,message=null,title,video_url=null } = req.body;
  const createDOMPurify = require('dompurify');
  const { JSDOM } = require('jsdom');
  const t = await sequelize.transaction();
  try {
    const foundGroup = await Study_Group.findOne({
      where: {id: groupId},
      attributes: ['active']
    })
    if(!foundGroup)
      throw new APIError("Grupo de estudos não encontrado.");
    if(!foundGroup.active)
      throw new APIError("Grupo de estudos inativado.");

    const foundUserGroup = await Study_Group_User.findOne({
      where: {
        UserId: user.id,
        StudyGroupId: groupId
      },
      attributes: ['id','active']
    })
    if(!foundUserGroup)
      throw new APIError("Usuário não pertence ao grupo.");
    if(!foundUserGroup.active)
      throw new APIError("Usuário não pertence ao grupo.");

    switch(type) {
      case "texto":
        if(!message)
          throw new APIError("Obrigatório envio da mensagem.");
        break;
      case "arquivo":
      case "imagem":
        if(!FileId)
          throw new APIError("Obrigatório envio de arquivo");
        break;
      case "video/vimeo":
      case "video/youtube":
        if(!video_url)
          throw new APIError("Obrigatório envio da url do vídeo");
        break;
      default:
        break;
    }

    let normalized = ""
    if(!!message) {
      const window = new JSDOM('').window;
      const DOMPurify = createDOMPurify(window);
      normalized = DOMPurify.sanitize(message);
    }

    const createdShare = await Study_Group_Share.create({
      UserId: user.id,
      StudyGroupId: groupId,
      type,
      message: !!message? normalized : null,
      title,
      video_url,
      FileId
    }, {transaction: t})
    if(!createdShare)
      throw new APIError("Houve um erro ao criar compartilhamento.");

    await t.commit();
    return res.json({
      success: true,
      data: createdShare
    })
  } catch (err) {
    await t.rollback();
    return res.status(err.status ? err.status : 500).json({
      success: false,
      message: err.message,
      status: err.status ? err.status : 500
    })
  }
};

const sendMessage = async (req, res, next) => {
  const { user } = req;
  const { groupId } = req.params;
  const { message } = req.body;
  const t = await sequelize.transaction();
  try {
    const foundGroup = await Study_Group.findOne({
      where: {id: groupId},
      attributes: ['active']
    })
    if(!foundGroup)
      throw new APIError("Grupo de estudos não encontrado.");
    if(!foundGroup.active)
      throw new APIError("Grupo de estudos inativado.");
    const foundUserGroup = await Study_Group_User.findOne({
      where: {
        UserId: user.id,
        StudyGroupId: groupId
      },
      attributes: ['id','active']
    })
    if(!foundUserGroup)
      throw new APIError("Usuário não pertence ao grupo.");
    if(!foundUserGroup.active)
      throw new APIError("Usuário não pertence ao grupo.");

    const createdMessage = await Study_Group_Message.create({
      UserId: user.id,
      StudyGroupId: groupId,
      message
    }, {transaction: t})
    if(!createdMessage)
      throw new APIError("Houve um erro ao tentar enviar mensagem.");

    const foundUsers = await Study_Group_User.findAll({
      where: {
        id: {[Op.not]: foundUserGroup.id},
        StudyGroupId: groupId,
        active: true
      },
      attributes: ['id', 'unread_messages']
    })
    let promises = []
    foundUsers.forEach((element) => {
      promises.push(
        element.update({
          unread_messages: element.unread_messages+1
        })
      )
    })
    Promise.all(promises)

    await t.commit();
    return res.json({
      success: true,
      data: createdMessage
    })
  } catch (err) {
    await t.rollback();
    return res.status(err.status ? err.status : 500).json({
      success: false,
      message: err.message,
      status: err.status ? err.status : 500
    })
  }

};

const saveNote = async (req, res, next) => {
  const { user } = req;
  const { groupId } = req.params;
  const { notes } = req.body;
  const u = await sequelize.transaction();
  const createDOMPurify = require('dompurify');
  const { JSDOM } = require('jsdom');
  try {
    const foundGroup = await Study_Group.findOne({
      where: {id: groupId},
      attributes: ['active']
    })
    if(!foundGroup)
      throw new APIError("Grupo de estudos não encontrado.");
    if(!foundGroup.active)
      throw new APIError("Grupo de estudos inativado.");
    const userGroup = await Study_Group_User.findOne({
      where: {
        UserId: user.id,
        StudyGroupId: groupId
      },
      attributes: ["id", "active"]
    })
    if(!userGroup)
      throw new APIError("Usuário não pertence ao grupo.");
    if(!userGroup.active)
      throw new APIError("Usuário tem de estar no grupo para editar notas.");

    let normalized = '';
    const window = new JSDOM('').window;
    const DOMPurify = createDOMPurify(window);
    normalized = DOMPurify.sanitize(notes);

    const updatedNotes = await userGroup.update({
      notes:normalized
    }, {transaction: u})
    if(!updatedNotes)
      throw new APIError("Houve um erro ao tentar salvar notas de estudo.");

    await u.commit();
    return res.json({
      success: true,
      data: updatedNotes
    })
  } catch (err) {
    await u.rollback();
    return res.status(err.status ? err.status : 500).json({
      success: false,
      message: err.message,
      status: err.status ? err.status : 500
    })
  }
};

export default {
  createGroup,
  getGroup,
  getGroupUsers,
  listGroups,
  editGroupInfo,
  removeGroupFromList,
  removePersonFromGroup,
  setAdminToGroup,
  insertInGroup,
  exitGroup,
  changeGroupCode,
  getGroupCode,
  listMessages,
  listShares,
  shareFiles,
  sendMessage,
  saveNote
};