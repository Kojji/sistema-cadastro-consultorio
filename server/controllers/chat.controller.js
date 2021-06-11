import APIError from '../helpers/APIError';
import db from '../models';
import { Op } from 'sequelize';

const { User, Chat_Message, User_Chat, User_Chat_Conversation, sequelize } = db;

const listMessages = async (req, res, next) => {
  const { user } = req;
  const { userId } = req.params;
  const { limit = 20, page = 1 } = req.query;
  const offset = 0 + (parseInt(page) - 1) * limit;
  try {
    const foundMessages = await Chat_Message.findAndCountAll({
      where: {
        to: [JSON.parse(JSON.parse(userId)), user.id], from: [JSON.parse(JSON.parse(userId)), user.id]
      },
      attributes: ['id', 'to', 'from', 'message', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    })
    const foundStatus = await User_Chat.findOne({
      where: {UserId: userId},
      attributes: ['connected']
    })
    const foundNotification = await User_Chat_Conversation.findOne({
      where: {
        to: user.id,
        from: JSON.parse(JSON.parse(userId))
      },
      attributes: ['id']
    })
    if(foundNotification) {
      foundNotification.update({
        active: true,
        unread_messages: 0
      })
    }
    return res.json({
      success: true,
      connected: !!foundStatus.connected,
      data: foundMessages.rows.reverse(),
      pagination: {
        limit,
        offset,
        page: parseInt(page),
        count: foundMessages.count,
        nextPage: offset + limit < foundMessages.count
      }
    });
  } catch (err) {
    return res.status(err.status ? err.status : 500).json({
      message: err.message,
      success: false,
      status: err.status ? err.status : 500,
    });
  }
}

// corrigir - ordenar
const listUsers = async (req, res, next) => {
  const { user } = req;
  const { limit = 20, page = 1 } = req.query;
  const offset = 0 + (parseInt(page) - 1) * limit;
  try {
    const foundUsers = await User_Chat.findAll({
      where: { UserId: { [Op.not]: user.id }},
      attributes: ['id', 'UserId', 'session', 'connected'],
      include: [
        {
          model: User,
          attributes: ['name', 'photo']
        }
      ],
      limit,
      offset
    })
    if(!foundUsers)
      throw new APIError("Houve um erro ao listar conversas.");

    return res.json({
      success: true,
      data: foundUsers,
      pagination: {
        limit,
        offset,
        page: parseInt(page),
        count: foundUsers.length,
        nextPage: offset + limit <= foundUsers.length
      }
    });
  } catch (err) {
    return res.status(err.status ? err.status : 500).json({
      message: err.message,
      success: false,
      status: err.status ? err.status : 500,
    });
  }
}

const listChats = async (req, res, next) => {
  const { user } = req;
  const { limit = 20, page = 1 } = req.query;
  const offset = 0 + (parseInt(page) - 1) * limit;
  try {
    const foundSession = await User_Chat.findOne({
      where: {UserId: user.id},
      attributes: ['id']
    })
    if(foundSession) {
      await foundSession.update({
          connected: true
      })
    }

    const foundChats = await User_Chat_Conversation.findAll({
      where: { to: user.id, active:true },
      include: [
        {
          model: User,
          as: 'other',
          attributes: ['name', 'photo']
        }
      ],
      attributes: [
        ['from', 'UserId'], 
        'updatedAt',
        'unread_messages',
        [sequelize.literal(`(SELECT "connected" FROM "User_Chats" as "users" WHERE "users"."UserId" = "User_Chat_Conversation"."from" LIMIT 1)`),
        'connected']
      ],
      order: [['updatedAt', 'DESC']],
      limit,
      offset
    })
    if(!foundChats)
      throw new APIError("Houve um erro ao listar conversas.");

    return res.json({
      success: true,
      data: foundChats,
      pagination: {
        limit,
        offset,
        page: parseInt(page),
        count: foundChats.length,
        nextPage: offset + limit <= foundChats.length
      }
    });
  } catch (err) {
    return res.status(err.status ? err.status : 500).json({
      message: err.message,
      success: false,
      status: err.status ? err.status : 500,
    });
  }
}

export default { listUsers, listChats, listMessages };