import APIError from '../helpers/APIError';
import db from '../models';

const { 
  Feed, 
  Comment, 
  File, 
  Inquiry, 
  Inquiry_Option, 
  Inquiry_Answer, 
  Feed_Area_Level_Course_Grade_Subject, 
  User_Permission,
  Area, 
  User,
  User_Area,
  Classroom,
  Classroom_Student,
  Student,
  sequelize
} = db;

/**
 * Get feed list by UserId.
 * @returns {Feed[]}
 */
const list = async (req, res, next) => {
  const { user } = req;
  const { limit = 20, page = 1 } = req.query;
  const offset = 0 + (parseInt(page) - 1) * limit;

  try {

    const feedsFound = await Feed.findAndCountAll({
      where: {
        UserId: user.id
      },
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'username', 'photo', 'profession'],
          include: [
            {
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
            }
          ]
        },
        { model: File, attributes: ['id', 'url_storage', 'type', 'name'] },
        {
          model: Inquiry, include: [
            {
              model: Inquiry_Option,
              attributes: [
                ['id', 'value'],
                ['option', 'label']
              ]
            }
          ],
          attributes: ['id', 'question', 'type']
        }
      ],
      attributes: {
        include: [
          [
            sequelize.literal(`(SELECT COUNT("id") FROM "Comments" AS "comment" WHERE "comment"."FeedId" = "Feed".id)`),
            'commentCount'
          ],
        ]
      },
      limit,
      offset
    })

    if (!feedsFound) {
      throw new APIError("Houve um erro ao tentar listar feeds do usuário.");
    }

    return res.json({
      success: true,
      files: feedsFound.rows,
      pagination: {
        limit,
        offset,
        page: parseInt(page),
        count: feedsFound.count,
        nextPage: offset + limit <= feedsFound.count
      }
    })
  } catch (err) {
    return res.status(err.status ? err.status : 500).json({
      success: false,
      message: err.message
    })
  }
}
/**
 * create feed.
 * @body type -> "professor", "aluno"
 * @body content_type -> "video/youtube", "video/vimeo", "pesquisa", "texto", "foto", "documento"
 * @body content
 * @body video_url
 * @body FileId
 * @body inquiry -> {
 *                      type -> "votacao", "resposta",
 *                      question
 *                      options -> [
 *                                      {
 *                                          option,
 *                                          correct
 *                                      }
 *                                 ]
 *                  }
 * @body fieldIds -> (index) 0 - Area, 1 - Level, 2 - Course, 3 - Grade, 4 - Subject
 */
const create = async (req, res, next) => {
  const { type, title, content=null, content_type, video_url, FileId, inquiry, fieldIds } = req.body;
  const { user } = req;
  const createDOMPurify = require('dompurify');
  const { JSDOM } = require('jsdom');

  const t = await sequelize.transaction();
  try {

    if(user.roleIds.includes(5) && user.roleIds.length == 1) {
      throw new APIError("Você não tem permissão para criar Feeds.");
    }

    if (type !== 'professor' && type !== 'aluno')
      throw new APIError("Campo \"type\" inválido.");

    let fieldArray = JSON.parse(fieldIds);
    if (fieldArray.length != 5)
      throw new APIError("Campo \"fieldIds\" com tamanho incorreto.");

    switch (content_type) {
      case "video/youtube":
      case "video/vimeo":
        if (!video_url)
          throw new APIError("Campo \"video_url\" obrigatório.");
        break;
      case "pesquisa":
        if (!inquiry)
          throw new APIError("Campo \"inquiry\" obrigatório.");
        if (inquiry.type != 'votacao' && inquiry.type != 'resposta') {
          throw new APIError("Campo \"inquiry.type\" inválido.");
        } else {
          if (!inquiry.options)
            throw new APIError("Campo \"inquiry.options\" obrigatório.");
          if (inquiry.options.length < 1)
            throw new APIError("Campo \"inquiry.options\" precisa ter pelo menos 1 item.");
        }
        break;
      case "texto":
        if (!content)
          throw new APIError("Campo \"content\" obrigatório.");
        break;
      case "foto":
        if (!FileId)
          throw new APIError("Campo \"FileId\" obrigatório.");
        break;
      case "documento":
        if (!FileId)
          throw new APIError("Campo \"FileId\" obrigatório.");
        if (!content)
          throw new APIError("Campo \"content\" obrigatório.");
        break;
      default:
        throw new APIError("Campo \"content_type\" inválido.");
    }

    let normalized = '';
    if (!!content) {
      const window = new JSDOM('').window;
      const DOMPurify = createDOMPurify(window);

      normalized = DOMPurify.sanitize(content);
    }

    if (FileId) {
      const fileFound = await File.findOne({
        where: { id: FileId },
        attributes: ['id']
      })

      if (!fileFound) {
        throw new APIError("Arquivo não encontrado.");
      }
    }
    /* approved:
      0 - reprovado
      1 - aprovado
      2 - avaliando
    */
    let approved = 2;
    if (user.roleIds.includes(1)) {
      approved = 1;
    }

    if(user.roleIds.includes(3)) {
      const foundPermission = await User_Permission.findOne({
        where: {
          UserId: user.id,
          PermissionId: 2
        }, attributes: ['id']
      })
      if(foundPermission)
        approved = 1;
    }

    const createFeed = await Feed.create({
      type: type,
      title,
      content_type: content_type,
      content: normalized,
      approved: approved,
      video_url: video_url,
      FileId: FileId,
      UserId: user.id
    }, { transaction: t });

    if (!createFeed) {
      throw new APIError("Houve um erro ao criar feed.");
    }

    if (content_type == "pesquisa") {
      const createInquiry = await Inquiry.create({
        FeedId: createFeed.id,
        type: inquiry.type,
        question: inquiry.question,
        UserId: user.id
      }, { transaction: t });

      if (!createInquiry) {
        throw new APIError("Houve um erro ao criar questionário.");
      }

      let promises = []
      inquiry.options.forEach((element) => {
        promises.push(
          Inquiry_Option.create({
            InquiryId: createInquiry.id,
            option: element.option,
            correct: element.correct
          })
        )
      })
      Promise.all(promises).then(() => {
      }).catch(() => {
        throw new APIError("Houve um erro ao criar resposta de questionário.");
      })
    }

    if (approved == 1) {
      if (fieldArray[0].length == 0) fieldArray[0].push(0)
      if (fieldArray[1].length == 0) fieldArray[1].push(0)
      if (fieldArray[2].length == 0) fieldArray[2].push(0)
      if (fieldArray[3].length == 0) fieldArray[3].push(0)
      if (fieldArray[4].length == 0) fieldArray[4].push(0)

      let arrayMerge = []
      fieldArray[0].forEach((area) => {
        fieldArray[1].forEach((level) => {
          fieldArray[2].forEach((course) => {
            fieldArray[3].forEach((grade) => {
              fieldArray[4].forEach((subject) => {
                arrayMerge.push([area, level, course, grade, subject])
              })
            })
          })
        })
      })

      let promisesFields = []
      arrayMerge.forEach((element) => {
        promisesFields.push(
          Feed_Area_Level_Course_Grade_Subject.create({
            FeedId: createFeed.id,
            AreaId: element[0] === 0 ? null : element[0],
            LevelId: element[1] === 0 ? null : element[1],
            CourseId: element[2] === 0 ? null : element[2],
            GradeId: element[3] === 0 ? null : element[3],
            SubjectId: element[4] === 0 ? null : element[4]
          })
        )
      })
      Promise.all(promisesFields).then(() => {
      }).catch(() => {
        throw new APIError("Houve um erro ao criar configurações de visibilidade.");
      })
    }

    await t.commit();

    return res.json({
      success: true,
      data: createFeed,
      message: 'Feed criado com sucesso!'
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

const createComment = async (req, res) => {
  const { feedId } = req.params;
  const { content, CommentId } = req.body;
  const { user } = req;
  const t = await sequelize.transaction();
  try {
    if (CommentId) {
      const commentFound = await Comment.findByPk(CommentId)

      if (!commentFound)
        throw new APIError("Comentário não encontrado.");

      if (commentFound.father)
        throw new APIError("Não é possível criar este comentário nesta profundidade.");
    } else {
      const feedFound = await Feed.findByPk(feedId)

      if (!feedFound)
        throw new APIError("Feed não encontrado.");
    }

    const userInfo = await User.findOne({
      where: {
        id: user.id
      }, 
      attributes: ['name', 'photo']
    })

    const createComment = await Comment.create({
      FeedId: feedId,
      UserId: user.id,
      content,
      father: CommentId
    }, { transaction: t });

    if (!createComment) {
      throw new APIError("Houve um erro ao cadastrar favorito.");
    }

    await t.commit();
    return res.json({
      message: 'Comentário criado com sucesso!',
      data:createComment,
      User: userInfo,
      success: true
    });
  } catch (err) {
    await t.rollback();
    return res.status(err.status ? err.status : 500).json({
      message: err.message,
      success: false,
      status: err.status ? err.status : 500
    });
  }
}

const listAllComments = async (req, res) => {
  const { feedId } = req.params;
  const { limit = 20, page = 1 } = req.query;
  const offset = 0 + (parseInt(page) - 1) * limit;

  try {

    const feedFound = await Feed.findByPk(feedId)
    if (!feedFound)
      throw new APIError("Feed não encontrado.");

    const foundComments = await Comment.findAndCountAll({
      where: {
        FeedId: feedId,
        father: null
      },
      include: [
        { model: User, attributes: ['name', 'photo'] }
      ],
      attributes: {
        include: [
          [
            sequelize.literal(`(SELECT COUNT("id") FROM "Comments" AS "comment" WHERE "comment"."father" = "Comment".id)`),
            'commentCount'
          ],
          [
            sequelize.literal(`(SELECT CASE WHEN "RoleId" = 4 THEN true ELSE false END FROM "User_Role_Institutions" AS "role" WHERE "role"."UserId" = "User".id LIMIT 1)`),
            'isProfessor'
          ],
        ]
      },
      order: [['createdAt', 'DESC']],
      limit,
      offset
    })

    if (!foundComments)
      throw new APIError("Houve um erro ao listar comentários.");

    return res.json({
      success: true,
      data: foundComments.rows.reverse(),
      pagination: {
        limit,
        offset,
        page: parseInt(page),
        count: foundComments.count,
        nextPage: offset + limit <= foundComments.count
      }
    })
  } catch (err) {
    return res.status(err.status ? err.status : 500).json({
      success: false,
      message: err.message
    })
  }
}

const getComment = async (req, res) => {
  const { commentId } = req.params;
  const { limit = 20, page = 1 } = req.query;
  const offset = 0 + (parseInt(page) - 1) * limit;

  try {

    const commentFound = await Comment.findByPk(commentId)
    if (!commentFound)
      throw new APIError("Comentário não encontrado.");

    const subComments = await Comment.findAndCountAll({
      where: {
        father: commentId
      },
      include: [
        { model: User, attributes: ['name', 'photo'] }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    })

    if (!subComments)
      throw new APIError("Houve um erro ao listar comentários.");

    return res.json({
      success: true,
      comment: commentFound,
      data: subComments.rows.reverse(),
      pagination: {
        limit,
        offset,
        page: parseInt(page),
        count: subComments.count,
        nextPage: offset + limit <= subComments.count
      }
    })
  } catch (err) {
    return res.status(err.status ? err.status : 500).json({
      success: false,
      message: err.message
    })
  }
}

const updateComment = async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;
  const { user } = req;
  const u = await sequelize.transaction();
  try {
    const userInfo = await User.findOne({
      where: {
        id: user.id
      }, 
      attributes: ['id', 'name', 'username', 'photo']
    })

    const commentFound = await Comment.findByPk(commentId)
    if (!commentFound)
      throw new APIError("Comentário não encontrado.");
    if (user.id != commentFound.UserId)
      throw new APIError("Você não possui permissão para atualizar comentário.");

    const updatedComment = await commentFound.update({
      content,
    }, { transaction: u });

    if (!updatedComment)
      throw new APIError("Houve um erro ao atualizar comentário.");

    await u.commit();
    
    return res.json({
      message: 'Comentário atualizado com sucesso!',
      data: updatedComment,
      User: userInfo,
      success: true
    });
  } catch (err) {
    await u.rollback();
    return res.status(err.status ? err.status : 500).json({
      success: false,
      message: err.message
    })
  }
}

const deleteComment = async (req, res) => {
  const { commentId } = req.params;
  const { user } = req;
  const d = await sequelize.transaction();
  
  try {
    const commentFound = await Comment.findByPk(commentId)
    if (!commentFound)
      throw new APIError("Comentário não encontrado.");
    if (user.id != commentFound.UserId)
      throw new APIError("Você não possui permissão para remover comentário.");

    // await deleteNestedComments(commentId, d)
    const nestedFound = await Comment.findAll({
      where: { father: commentId }
    })

    const deletedComment = await commentFound.destroy({}, { transaction: d });

    if (!deletedComment)
      throw new APIError("Houve um erro ao remover comentário.");

    if (nestedFound.length > 0) {
      let promises = []
      nestedFound.forEach(element => {
        promises.push(element.destroy({}))
      })
      Promise.all(promises).then(() => {
      }).catch(() => {
        throw new APIError("Houve um erro ao excluir comentários atrelados.");
      })
    }

    await d.commit();

    return res.json({
      message: 'Comentário removido com sucesso!',
      success: true
    });
  } catch (err) {
    await d.rollback();
    return res.status(err.status ? err.status : 500).json({
      success: false,
      message: err.message
    })
  }
}

// const deleteNestedComments = async (commentId, transaction) => {
//   const commentFound = await Comment.findAll({
//     where: { father: commentId },
//     attributes: ['id', 'father']
//   })
//   if (commentFound.length === 0) return
//   commentFound.forEach(element => {
//     if (element.father) {
//       element.destroy({}, { transaction });
//       return deleteNestedComments(element.id)
//     } else {
//       return element.destroy({}, { transaction });
//     }
//   })
// }

const get = async (req, res) => {
  const { feedId } = req.params;

  try {
    const feedFound = await Feed.findOne({
      where: {
        id: feedId
      },
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'username', 'photo', 'profession'],
          include: [
            {
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
            }
          ]
        },
        { model: File, attributes: ['id', 'url_storage', 'type', 'name'] },
        {
          model: Inquiry, include: [
            {
              model: Inquiry_Option,
              attributes: [
                ['id', 'value'],
                ['option', 'label']
              ]
            }
          ],
          attributes: ['id', 'question', 'type']
        }
      ],
      attributes: {
        include: [
          [
            sequelize.literal(`(SELECT COUNT("id") FROM "Comments" AS "comment" WHERE "comment"."FeedId" = "Feed".id AND "father" IS NULL)`),
            'commentCount'
          ],
        ]
      },
    })

    if (!feedFound)
      throw new APIError("Feed não encontrado.");

    return res.json({
      data: feedFound,
      success: true
    });
  } catch (err) {
    return res.status(err.status ? err.status : 500).json({
      message: err.message,
      success: false,
      status: err.status ? err.status : 500
    });
  }
}

const update = async (req, res) => {
  const { feedId } = req.params;
  const { title, content, video_url, FileId, inquiry, fieldIds } = req.body;
  const { user } = req;
  const createDOMPurify = require('dompurify');
  const { JSDOM } = require('jsdom');

  const u = await sequelize.transaction();
  const t = await sequelize.transaction();
  try {
    let update = {approved: 2};
    const feedFound = await Feed.findByPk(feedId)

    if (!feedFound)
      throw new APIError("Feed não encontrado.");

    if (feedFound.UserId != user.id && !user.isAdmin)
      throw new APIError("Você não tem permissão para atualizar este Feed.");

    let deleteFile;
    if (FileId) {
      deleteFile = await File.findByPk(feedFound.FileId);
      update.FileId = FileId;
    }

    if (fieldIds) {
      let fieldArray = JSON.parse(fieldIds);
      if (fieldArray.length != 5)
        throw new APIError("Campo \"fieldIds\" com tamanho incorreto.");

      const foundFeedRelations = await Feed_Area_Level_Course_Grade_Subject.findAll({
        where: {
          FeedId: feedId
        }
      })
      if (!foundFeedRelations) throw new APIError("Houve um erro ao buscar configurações de visibilidade do feed.");

      let promisesDelete = []
      foundFeedRelations.forEach((element) => {
        promisesDelete.push(
          element.destroy({})
        )
      })
      Promise.all(promisesDelete).then(() => {
      }).catch(() => {
        throw new APIError("Houve um erro ao remover velhas configurações de visibilidade do feed.");
      })

      if (fieldArray[0].length == 0) fieldArray[0].push(0)
      if (fieldArray[1].length == 0) fieldArray[1].push(0)
      if (fieldArray[2].length == 0) fieldArray[2].push(0)
      if (fieldArray[3].length == 0) fieldArray[3].push(0)
      if (fieldArray[4].length == 0) fieldArray[4].push(0)

      let arrayMerge = []
      fieldArray[0].forEach((area) => {
        fieldArray[1].forEach((level) => {
          fieldArray[2].forEach((course) => {
            fieldArray[3].forEach((grade) => {
              fieldArray[4].forEach((subject) => {
                arrayMerge.push([area, level, course, grade, subject])
              })
            })
          })
        })
      })

      let promisesCreate = []
      arrayMerge.forEach((element) => {
        promisesCreate.push(
          Feed_Area_Level_Course_Grade_Subject.create({
            FeedId: feedId,
            AreaId: element[0] === 0 ? null : element[0],
            LevelId: element[1] === 0 ? null : element[1],
            CourseId: element[2] === 0 ? null : element[2],
            GradeId: element[3] === 0 ? null : element[3],
            SubjectId: element[4] === 0 ? null : element[4]
          })
        )
      })
      Promise.all(promisesCreate).then(() => {
      }).catch(() => {
        throw new APIError("Houve um erro ao criar novas configurações de visibilidade do feed.");
      })

    }

    if (inquiry) {
      const editInquiry = await Inquiry.findOne({
        where: {
          FeedId: feedId
        }
      });
      if (!editInquiry) throw new APIError("Questionário a ser editado não encontrado.");
      const updatedInquiry = await editInquiry.update({
        question: inquiry.question
      }, { transaction: t });

      if (!updatedInquiry) throw new APIError("Houve um erro ao atualizar questionário.");
    }

    if (content) {
      const window = new JSDOM('').window;
      const DOMPurify = createDOMPurify(window);

      update.content = DOMPurify.sanitize(content);
    }

    if(title) {
      update.title = title;
    }

    if (video_url) update.video_url = video_url;

    const updatedFeed = await feedFound.update(update, { transaction: u });

    if (!updatedFeed)
      throw new APIError("Houve um erro ao atualizar Feed.");

    if (deleteFile) {
      File.deleteAndDestroy(deleteFile);
    }

    await u.commit();
    await t.commit();

    return res.json({
      message: "Feed atualizado com sucesso!",
      data: updatedFeed,
      success: true,
    });
  } catch (err) {
    await u.rollback();
    await t.rollback();
    return res.status(err.status ? err.status : 500).json({
      message: err.message,
      success: false,
      status: err.status ? err.status : 500
    });
  }
}

const createInquiryOption = async (req, res) => {
  const { option, correct } = req.body;
  const { inquiryId } = req.params;
  const { user } = req;
  const t = await sequelize.transaction();
  try {
    const foundInquiry = await Inquiry.findByPk(inquiryId);

    if (!foundInquiry) throw new APIError("Questionário não encontrado.");
    if (foundInquiry.UserId != user.id) throw new APIError("Você não tem permissão para criar uma resposta para este questionário.");

    const createdInquiryOption = await Inquiry_Option.create({
      InquiryId: inquiryId,
      option,
      correct,
    }, { transaction: t });

    if (!createdInquiryOption) throw new APIError("Houve um problema ao criar uma resposta de questionário.");

    await t.commit();
    return res.json({
      message: "Resposta de questionário criado com sucesso!",
      data: createdInquiryOption,
      success: true,
    });
  } catch (err) {
    await t.rollback();
    return res.status(err.status ? err.status : 500).json({
      message: err.message,
      success: false,
      status: err.status ? err.status : 500
    });
  }
}

const removeInquiryOption = async (req, res) => {
  const { optionId } = req.params;
  const { user } = req;
  const d = await sequelize.transaction();
  try {
    const foundInquiryOption = await Inquiry_Option.findByPk(optionId);

    if (!foundInquiryOption) throw new APIError("Resposta de questionário não encontrado.");

    const foundInquiry = await Inquiry.findByPk(foundInquiryOption.InquiryId);
    if (!foundInquiry) throw new APIError("Questionário não encontrado.");
    if (foundInquiry.UserId != user.id) throw new APIError("Você não tem permissão para remover esta resposta de questionário.");

    const deletedOption = await foundInquiryOption.destroy({}, { transaction: d });
    if (!deletedOption) throw new APIError("Houve um erro ao tentar remover resposta de questionário.");

    await d.commit();
    return res.json({
      message: "Resposta de questionário removido com sucesso!",
      success: true,
    });
  } catch (err) {
    await d.rollback();
    return res.status(err.status ? err.status : 500).json({
      message: err.message,
      success: false,
      status: err.status ? err.status : 500
    });
  }
}

const respondInquiry = async (req, res) => {
  const { optionId } = req.params;
  const { user } = req;
  const t = await sequelize.transaction();
  let toRollback = true;
  try {
    const foundInquiry = await Inquiry.findOne({
      include: [
        {model: Inquiry_Option, where: { id: optionId }, attributes: ['id', 'InquiryId', 'correct'] }
      ], attributes: ['id', 'type']
    })
    if (!foundInquiry) throw new APIError("Questionário não encontrado.");

    const foundAnswer = await Inquiry_Answer.findOne({
      where: { InquiryId: foundInquiry.id, UserId: user.id }, attributes: ['id']
    })

    // let data = {}
    if(foundAnswer) {
      throw new APIError("Não é possível responder pesquisa mais de 1 vez.");
      // const updatedAnswer = await foundAnswer.update({
      //   InquiryOptionId: optionId
      // }, { transaction: t })

      // if (!updatedAnswer) throw new APIError("Houve um erro ao tentar salvar resposta.");
  
      // await t.commit();
      // data = updatedAnswer;
    }
    const createdInquiryAnswer = await Inquiry_Answer.create({
      InquiryId: foundInquiry.id,
      InquiryOptionId: optionId,
      UserId: user.id,
    }, { transaction: t });

    if (!createdInquiryAnswer) throw new APIError("Houve um erro ao tentar salvar resposta.");

    await t.commit();

    if(foundInquiry.type == "votacao") {
      const foundPercentage = await Inquiry_Option.findAll({
        where: { InquiryId: foundInquiry.id },
        attributes: {
          include: [
            [
              sequelize.literal(`(SELECT COUNT("id") FROM "Inquiry_Answers" as "answer" WHERE "answer"."InquiryOptionId" = "Inquiry_Option".id)`),
              'voteCount'
            ],
          ], 
          exclude: ['createdAt', 'updatedAt', 'correct', 'InquiryId']
        },
      })
      if (!foundPercentage) {
        toRollback = false;
        throw new APIError("Houve um erro ao tentar listar respostas da pesquisa.");
      }
      return res.json({
        data: createdInquiryAnswer,
        percentage: foundPercentage,
        success: true,
      });
    } else {
      return res.json({
        data: createdInquiryAnswer,
        correct: foundInquiry.Inquiry_Options[0].correct,
        success: true,
      });
    }
  } catch (err) {
    if(toRollback) await t.rollback();
    return res.status(err.status ? err.status : 500).json({
      message: err.message,
      success: false,
      status: err.status ? err.status : 500
    });
  }
}

const listInquiryAnswers = async (req, res) => {
  const { inquiryId } = req.params;
  const { user } = req;

  try {
    const foundInquiry = await Inquiry.findAll({
      where: { id: inquiryId },
      include: [
        { model: Inquiry_Option, include: [{ model: Inquiry_Answer }] },
      ]
    });
    if (!foundInquiry) throw new APIError("Questionário não encontrado.");

    if (foundInquiry[0].UserId != user.id && !user.isAdmin) {
      throw new APIError("Você não tem permissão para acessar este local");
    }

    return res.json({
      data: foundInquiry,
      success: true,
    });
  } catch (err) {
    return res.status(err.status ? err.status : 500).json({
      message: err.message,
      success: false,
      status: err.status ? err.status : 500
    });
  }
}
const viewInquiryPercentage = async (req, res) => {
  const { inquiryId } = req.params;
  const { user } = req;
  try {
    const foundPercentage = await Inquiry_Option.findAll({
      where: { InquiryId: inquiryId },
      attributes: {
        include: [
          [
            sequelize.literal(`(SELECT COUNT("id") FROM "Inquiry_Answers" as "answer" WHERE "answer"."InquiryOptionId" = "Inquiry_Option".id)`),
            'voteCount'
          ],
        ], 
        exclude: ['createdAt', 'updatedAt', 'correct', 'InquiryId']
      },
    })
    if (!foundPercentage) throw new APIError("Houve um erro ao tentar listar respostas da pesquisa.");
    return res.json({
      data: foundPercentage,
      success: true,
    });

  } catch (err) {
    return res.status(err.status ? err.status : 500).json({
      message: err.message,
      success: false,
      status: err.status ? err.status : 500
    });
  }
}

const filteredList = async (req, res) => {
  const { limit = 20, page = 1, area, level, course, grade, subject, type } = req.query;
  const { user } = req;
  const offset = 0 + (parseInt(page) - 1) * limit;

  try {
    let filters = {
      type,
      area:null,
      level:null,
      course:null,
      grade:null,
      subject:null
    }
    let whereRelations = {}
    if(!type) {
      if(user.roleIds.includes(4)) {
        filters.type = "professor";
        const foundUserAreas = await User_Area.findAll({
          where: {UserId: user.id},
          include: [{
            model: Area,
            attributes: ['id']
          }], attributes:['id']
        })
        if(foundUserAreas) {
          if(foundUserAreas.length > 0) {
            let areaArray = foundUserAreas.map(element => {return element.Area.id});
            filters.area = areaArray;
            whereRelations = { ...whereRelations, AreaId: areaArray };
          }
        }
        if (!!level) {
          whereRelations = { ...whereRelations, LevelId: JSON.parse(level) }
          filters.level = JSON.parse(level);
        }
        if (!!course) {
          whereRelations = { ...whereRelations, CourseId: JSON.parse(course) }
          filters.course = JSON.parse(course);
        }
        if (!!grade) {
          whereRelations = { ...whereRelations, GradeId: JSON.parse(grade) }
          filters.grade = JSON.parse(grade);
        }
        if (!!subject) {
          whereRelations = { ...whereRelations, SubjectId: JSON.parse(subject) }
          filters.subject = JSON.parse(subject);
        }
      } else {
        filters.type = "aluno";
        const student = await Student.schema(user.schemaname).findOne({
          where: { UserId: user.id },
          attributes: ['id', 'LevelId', 'GradeId']
        })
        if(student) {
          if(student.LevelId) {
            whereRelations = { ...whereRelations, LevelId: student.LevelId }
            filters.level = student.LevelId;
          }
          if(student.GradeId) {
            whereRelations = { ...whereRelations, GradeId: student.GradeId }
            filters.grade = student.GradeId;
          }
          if (!!course) {
            whereRelations = { ...whereRelations, CourseId: JSON.parse(course) }
            filters.course = JSON.parse(course);
          }
          if (!!area) {
            whereRelations = { ...whereRelations, AreaId: JSON.parse(area) }
            filters.area = JSON.parse(area);
          }
          if (!!subject) {
            whereRelations = { ...whereRelations, SubjectId: JSON.parse(subject) }
            filters.subject = JSON.parse(subject);
          }
        }
      }
    } else {
      if (!!area) {
        whereRelations = { ...whereRelations, AreaId: JSON.parse(area) }
        filters.area = JSON.parse(area);
      }
      if (!!level) {
        whereRelations = { ...whereRelations, LevelId: JSON.parse(level) }
        filters.level = JSON.parse(level);
      }
      if (!!course) {
        whereRelations = { ...whereRelations, CourseId: JSON.parse(course) }
        filters.course = JSON.parse(course);
      }
      if (!!grade) {
        whereRelations = { ...whereRelations, GradeId: JSON.parse(grade) }
        filters.grade = JSON.parse(grade);
      }
      if (!!subject) {
        whereRelations = { ...whereRelations, SubjectId: JSON.parse(subject) }
        filters.subject = JSON.parse(subject);
      }
  
      if (type == 'professor' && user.roleIds.includes(5)) {
        throw new APIError("Você não possui permissão para acessar feed de professores.");
      } else if (type == 'aluno' && user.roleIds.includes(4)) {
        throw new APIError("Você não possui permissão para acessar feed de alunos.");
      }
    }
    const feedList = await Feed.findAll({
      where: {
        type: filters.type,
        approved: 1
      },
      limit,
      offset,
      order: [['updatedAt', 'DESC']],
      include: [
        { model: Feed_Area_Level_Course_Grade_Subject, where: whereRelations, attributes: [] },
        {
          model: User,
          attributes: ['name', 'photo', 'profession'],
          include: [
            { 
              model: User_Area, 
              include: [
                { model: Area, attributes: ['id', 'title'] }
              ], attributes: ['id']
            }
          ]
        },
        { model: File, attributes: ['id', 'url_storage', 'type', 'name'] },
        {
          model: Inquiry,
          include: [
            {
              model: Inquiry_Option,
              attributes: [
                ['id', 'value'],
                ['option', 'label']
              ]
            }
          ],
          attributes: {
            include: [
              [
                sequelize.literal(`(SELECT "InquiryOptionId" FROM "Inquiry_Answers" AS "answers" WHERE "answers"."InquiryId" = "Inquiry".id AND "answers"."UserId" = ${user.id} LIMIT 1)`),
                'responded'
              ],
              [
                sequelize.literal(`(SELECT "id" FROM "Inquiry_Options" AS "options" WHERE "options"."InquiryId" = "Inquiry".id AND "options"."correct" = TRUE LIMIT 1)`),
                'correctOption'
              ],
            ],
            exclude: [
              'createdAt', 'updatedAt', 'FeedId', 'UserId'
            ]
          },
          order: [['id', 'ASC']]
        }
      ],
      attributes: {
        include: [
          [
            sequelize.literal(`(SELECT CASE WHEN COUNT("FeedId") > 0 THEN true ELSE false END FROM "Favorites" AS "favorite" WHERE "favorite"."FeedId" = "Feed".id AND "favorite"."UserId" = ${user.id} LIMIT 1)`),
            'isFavorite'
          ],
          [
            sequelize.literal(`(SELECT COUNT("id") FROM "Comments" AS "comment" WHERE "comment"."FeedId" = "Feed".id AND "father" IS NULL)`),
            'commentCount'
          ],
        ]
      }
    })

    if (!feedList) {
      throw new APIError("Houve um erro ao listar Feeds.");
    }

    return res.json({
      data: feedList,
      filters,
      success: true,
      pagination: {
        limit,
        offset,
        page: parseInt(page),
        count: feedList.length,
        nextPage: offset + limit <= feedList.length
      }
    });
  } catch (err) {
    return res.status(err.status ? err.status : 500).json({
      message: err.message,
      success: false,
      status: err.status ? err.status : 500
    });
  }
}

const listToApprove = async (req, res) => {
  const { limit = 20, page = 1, userId = null } = req.query;
  const { user } = req;
  const offset = 0 + (parseInt(page) - 1) * limit;

  try {
    if (!userId && !user.roleIds.includes(1))
      throw new APIError("Você não possui permissão para listar estes feeds.");
    
    if (!!userId && !user.roleIds.includes(4))
      throw new APIError("Somente professores possuem permissão para listar estes feeds.");
    
    if (user.id != userId && !user.roleIds.includes(1))
      throw new APIError("Somente o professor possui permissão para listar estes feeds.");

    const feedList = await Feed.findAndCountAll({
      where: !!userId ? {
        approved: 2,
        UserId: userId
      } : {
        approved: 2
      },
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'username', 'photo', 'profession'],
          include: [
            {
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
            }
          ]
        },
        { model: File, attributes: ['id', 'url_storage', 'type', 'name'] },
        {
          model: Inquiry, include: [
            { model: Inquiry_Option, attributes: ['id', 'option'] }
          ], attributes: ['id', 'question', 'type']
        }
      ],
      order: [['createdAt', 'ASC']],
      limit,
      offset
    });

    if (!feedList)
      throw new APIError("Houve um erro ao listar feeds.");

    return res.json({
      data: feedList.rows,
      success: true,
      pagination: {
        limit,
        offset,
        page: parseInt(page),
        count: feedList.count,
        nextPage: offset + limit <= feedList.count
      }
    });
  } catch (err) {
    return res.status(err.status ? err.status : 500).json({
      message: err.message,
      success: false,
      status: err.status ? err.status : 500
    });
  }
}

const changeApproved = async (req, res) => {
  const { FeedId, approved, type, fieldIds } = req.body;
  const { user } = req;
  const u = await sequelize.transaction();
  try {
    const feedFound = await Feed.findByPk(FeedId)

    if (!feedFound)
      throw new APIError("Feed não encontrado.");

    if (!user.roleIds.includes(1))
      throw new APIError("Você não possui permissão editar status do feed.");

    let fieldArray = JSON.parse(fieldIds);
    if (fieldArray.length != 5)
      throw new APIError("Campo \"fieldIds\" com tamanho incorreto.");

    const updatedFeed = await feedFound.update({
      approved,
      type
    }, { transaction: u });

    if (!updatedFeed)
      throw new APIError("Houve um erro ao atualizar feed.");

    if (fieldArray[0].length == 0) fieldArray[0].push(0)
    if (fieldArray[1].length == 0) fieldArray[1].push(0)
    if (fieldArray[2].length == 0) fieldArray[2].push(0)
    if (fieldArray[3].length == 0) fieldArray[3].push(0)
    if (fieldArray[4].length == 0) fieldArray[4].push(0)

    let arrayMerge = []
    fieldArray[0].forEach((area) => {
      fieldArray[1].forEach((level) => {
        fieldArray[2].forEach((course) => {
          fieldArray[3].forEach((grade) => {
            fieldArray[4].forEach((subject) => {
              arrayMerge.push([area, level, course, grade, subject])
            })
          })
        })
      })
    })

    let promisesFields = []
    arrayMerge.forEach((element) => {
      promisesFields.push(
        Feed_Area_Level_Course_Grade_Subject.create({
          FeedId: feedFound.id,
          AreaId: element[0] === 0 ? null : element[0],
          LevelId: element[1] === 0 ? null : element[1],
          CourseId: element[2] === 0 ? null : element[2],
          GradeId: element[3] === 0 ? null : element[3],
          SubjectId: element[4] === 0 ? null : element[4]
        })
      )
    })
    Promise.all(promisesFields).then(() => {
    }).catch(() => {
      throw new APIError("Houve um erro ao criar configurações de visibilidade.");
    })

    await u.commit();

    return res.json({
      message: 'Publicação aprovada com sucesso!',
      success: true
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

export default {
  get,
  list,
  create,
  createComment,
  getComment,
  updateComment,
  deleteComment,
  listAllComments,
  update,
  viewInquiryPercentage,
  filteredList,
  listToApprove,
  changeApproved,
  createInquiryOption,
  removeInquiryOption,
  respondInquiry,
  listInquiryAnswers
};
