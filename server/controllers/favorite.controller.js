import APIError from '../helpers/APIError';
import db from '../models';
import { Op } from 'sequelize';

const { Feed, Favorite, Feed_Area_Level_Course_Grade_Subject, User, File, Inquiry, Inquiry_Option, Area, User_Area, sequelize } = db;

/**
 * Get favorite list by UserId.
 * @returns {Favorite[]}
 * @query filter -> 'area', 'level', 'grade','course', 'subject', 'autor', 'created'
 *
 */
const list = async (req, res, next) => {
  const { user } = req;
  const { limit = 20, page = 1, filter, id } = req.query;
  const offset = 0 + (parseInt(page) - 1) * limit;

  try {
    let orderArray = [];
    switch (filter) {
      case 'area':
        orderArray.push([Feed, Feed_Area_Level_Course_Grade_Subject, 'AreaId', 'asc']);
        break;
      case 'level':
        orderArray.push([Feed, Feed_Area_Level_Course_Grade_Subject, 'LevelId', 'asc']);
        break;
      case 'course':
        orderArray.push([Feed, Feed_Area_Level_Course_Grade_Subject, 'CourseId', 'asc']);
        break;
      case 'grade':
        orderArray.push([Feed, Feed_Area_Level_Course_Grade_Subject, 'GradeId', 'asc']);
        break;
      case 'subject':
        orderArray.push([Feed, Feed_Area_Level_Course_Grade_Subject, 'SubjectId', 'asc']);
        break;
      case 'created':
        orderArray.push([Feed, 'createdAt', 'asc']);
        break;
      case 'autor':
        orderArray.push([Feed, User, 'username', 'asc']);
        break;
      case 'favorite':
        orderArray.push(['createdAt', 'asc']);
        break;
      default:
        throw new APIError("Filtro inválido.");
    }

    let where = {
        UserId: user.id
    };

    if (!!id) {
        where = {...where, id};
    }

    const favorites = await Favorite.findAll({
      where,
      include: [
        {
          model: Feed, include: [
            { model: User, attributes: ['photo', 'name', 'profession'], include: [{
              model: User_Area,
              attributes: {
                exclude: ['createdAt', 'updatedAt']
              },
              include: [
                {
                  model: Area,
                  attributes: ['id', 'title']
                }
              ]
            }] },
            { model: File, attributes: ['id', 'url_storage', 'type', 'name'] },
            {
              model: Inquiry, include: [
                { model: Inquiry_Option, attributes: [
                  ['id', 'value'],
                  ['option', 'label']
                ] }
              ], attributes: ['id', 'question', 'type']
            },
            { model: Feed_Area_Level_Course_Grade_Subject }
          ],
        },
      ],
      attributes: ['id', 'FeedId', 'createdAt'],
      order: filter ? orderArray : null,
      limit,
      offset
    })

    if (!favorites) {
      throw new APIError("Houve um erro ao listar favoritos.");
    }

    return res.json({
      success: true,
      data: favorites,
      pagination: {
        limit,
        offset,
        page: parseInt(page),
        count: favorites.length,
        nextPage: offset + limit <= favorites.length
      }
    })
  } catch (err) {
    return res.status(err.status ? err.status : 500).json({
      success: false,
      message: err.message
    })
  }
}

const create = async (req, res, next) => {
  const { FeedId } = req.body;
  const { user } = req;
  const t = await sequelize.transaction();
  try {
    const favoriteFound = await Favorite.findOne({
      where: {
        [Op.and]: {
          UserId: user.id,
          FeedId
        }
      }
    })

    if (favoriteFound) {
      throw new APIError("Favorito já registrado.");
    }

    const createFavorite = await Favorite.create({
      FeedId,
      UserId: user.id
    }, { transaction: t });

    if (!createFavorite) {
      throw new APIError("Houve um erro ao criar favorito.");
    }

    await t.commit();

    return res.json({
      success: true,
      data: createFavorite,
      message: 'Favorito criado com sucesso!'
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

const remove = async (req, res, next) => {
  const { FeedId } = req.params;
  const { user } = req;

  const r = await sequelize.transaction();
  try {
    const favoriteFound = await Favorite.findOne({
      where: {
        [Op.and]: {
          UserId: user.id,
          FeedId
        }
      }
    })
    if (!favoriteFound) {
      throw new APIError("Favorito não encontrado.");
    }

    const removeFavorite = await favoriteFound.destroy({}, { transaction: r });

    if (!removeFavorite) {
      throw new APIError("Houve um erro ao remover o favorito.");
    }


    r.commit();

    return res.json({
      success: true,
      message: "Favorito removido com sucesso!"
    });
  } catch (err) {
    r.rollback();
    return res.status(err.status ? err.status : 500).json({
      message: err.message,
      success: false,
      status: err.status ? err.status : 500
    });
  }
}

export default {
  list, create, remove
};
