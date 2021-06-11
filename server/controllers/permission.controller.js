import db from '../models';
import APIError from '../helpers/APIError';

const {
  Permission,
  User_Permission,
  User_Role_Institution,
  User,
  sequelize
} = db;

const list = async (req, res, next) => {
  const { user } = req;
  try {
    if (!user.roleIds.includes(1)) {
      throw new APIError("Você não possui permissão visualizar as permissões do sistema.");
    }

    const foundPermissions = await Permission.findAll({
      where: {active: true},
      attributes: ['id', 'alias', 'description']
    })
    if(!foundPermissions)
      throw new APIError("Houve um erro ao tentar listar as permissões do sistema.");

    return res.json({
      success: true,
      data: foundPermissions
    })
  } catch (err) {
    return res.status(err.status ? err.status : 500).json({
      success: false,
      message: err.message,
      status: err.status ? err.status : 500
    })
  }
}

const includeToUser = async (req, res, next) => {
  const { user } = req;
  const { userId, permissionId } = req.params;
  const t = await sequelize.transaction();
  try {
    if (!user.roleIds.includes(1)) {
      throw new APIError("Você não possui permissão atribuir permissão aos redatores do sistema.");
    }

    const foundUserRole = await User_Role_Institution.findOne({
      where: { UserId: userId, RoleId: 3 },
      attributes: ['id']
    })
    if(!foundUserRole)
      throw new APIError("Usuário não encontrado, ou não é redator.");

    const foundUserPermission = await User_Permission.findOne({
      where: {
        PermissionId: permissionId,
        UserId: userId
      }
    })
    if(foundUserPermission)
      throw new APIError("Redator já tem essa permissão.");  

    const createdUserPermission = await User_Permission.create({
      PermissionId: permissionId,
      UserId: userId
    }, {transaction: t})
    if(!createdUserPermission)
      throw new APIError("Houve um erro ao tentar incluir permissão.");

    await t.commit();
    return res.json({
      success: true,
      data: "Permissão incluida com sucesso!"
    })
  } catch (err) {
    await t.rollback();
    return res.status(err.status ? err.status : 500).json({
      success: false,
      message: err.message,
      status: err.status ? err.status : 500
    })
  }
}

const listUsers = async (req, res, next) => {
  const { user } = req;
  const { limit = 20, page = 1 } = req.query;
  const offset = 0 + (parseInt(page) - 1) * limit;
  try {
    if (!user.roleIds.includes(1)) {
      throw new APIError("Você não possui permissão visualizar os redatores do sistema.");
    }

    const foundUsers = await User.findAll({
      include: [
        {
          model: User_Role_Institution, 
          where: {RoleId: 3},
          attributes: ['id', 'RoleId']
        }, 
        {
          model: User_Permission, 
          include: [
            {
              model: Permission, 
              attributes: ['id', 'alias', 'description']
            }
          ], 
          attributes: ['id']
        }
      ],
      attributes: ['id', 'name', 'username', 'photo', 'email'],
      limit,
      offset
    })
    if(!foundUsers)
      throw new APIError("Houve um erro ao tentar listar os redatores do sistema.");

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
    })
  } catch (err) {
    return res.status(err.status ? err.status : 500).json({
      success: false,
      message: err.message,
      status: err.status ? err.status : 500
    })
  }
}

const removeFromUser = async (req, res, next) => {
  const { user } = req;
  const { userId, permissionId } = req.params;
  const d = await sequelize.transaction();
  try {
    if (!user.roleIds.includes(1)) {
      throw new APIError("Você não possui permissão para remover permissões dos redatores do sistema.");
    }

    const foundUserPermission = await User_Permission.findOne({
      where: {
        PermissionId: permissionId,
        UserId: userId
      }
    })
    if(!foundUserPermission)
      throw new APIError("Permissão não atribuida ao usuário.");  

    const removedUserPermission = await foundUserPermission.destroy({transaction: d})
    if(!removedUserPermission)
      throw new APIError("Houve um erro ao tentar remover permissão.");

    await d.commit();
    return res.json({
      success: true,
      data: "Permissão removida com sucesso!"
    })
  } catch (err) {
    await d.rollback();
    return res.status(err.status ? err.status : 500).json({
      success: false,
      message: err.message,
      status: err.status ? err.status : 500
    })
  }
}

const getPermissionByUser = async (req, res, next) => {
  const { user } = req;
  const { userId } = req.params;
  try {
    if (!user.roleIds.includes(1) && user.id !== userId) {
      throw new APIError("Você não possui permissão para visualizar permissões do usuário.");
    }

    const foundUserPermissions = await User_Permission.findAll({
      where: {
        UserId: userId
      },
      attributes: ['id'],
      include: [
        {
          model: Permission,
          attributes: ['id', 'alias', 'description']
        }
      ]
    })
    if(!foundUserPermissions)
      throw new APIError("Houve um erro ao tentar listar permissões do usuário.");  

    return res.json({
      success: true,
      data: foundUserPermissions
    })
  } catch (err) {
    return res.status(err.status ? err.status : 500).json({
      success: false,
      message: err.message,
      status: err.status ? err.status : 500
    })
  }
}
export default {
  list, includeToUser, listUsers, removeFromUser, getPermissionByUser
};