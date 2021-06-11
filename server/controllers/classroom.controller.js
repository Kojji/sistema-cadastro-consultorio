import httpStatus from 'http-status';
import db from '../models';
import crypto from "crypto-js";
import APIError from '../helpers/APIError';
import { add, isBefore } from 'date-fns';
import { Op, QueryTypes } from 'sequelize';
import moment from 'moment';


const { 
  Classroom,
  Classroom_Code,
  Professor, 
  Student, 
  File,
  Classroom_Student, 
  Classroom_Feed_Inquiry, 
  Classroom_Feed_Inquiry_Option, 
  Classroom_Feed, 
  Classroom_Feed_Comment,
  Classroom_Feed_Inquiry_Answer,
  Activity,
  Activity_Question,
  Activity_Option,
  Activity_Question_Answer,
  Activity_Question_Student_File,
  Activity_Result,
  Activity_Class_Teach,
  Activity_Class_Teach_Student,
  Level, 
  Grade, 
  Subject, 
  Course, 
  User,
  Area,
  User_Area,
  sequelize 
} = db;

/**
 * Get classroom
 * @returns {Classroom}
 */
const get = async (req, res) => {
  const { user } = req;
  const { classroomId } = req.params;

  try {
    if (!user.roleIds.some(role => role === 1 || role === 4 || role === 5)) {
      throw new APIError("Você não tem permissão para visualizar salas de aula.");
    }

    let include = [
      { model: Level },
      { model: Subject, include: [{ model: Grade }] },
      { model: Course }
    ]

    if (user.roleIds.some(role => role === 4)) {
      include = [...include, {
        model: Classroom_Student.schema(user.schemaname),
        include: [
          {
            model: Student.schema(user.schemaname),
            include: [
              {
                model: User,
                attributes: ['id', 'name', 'phone', 'email', 'photo']
              }
            ]
          }
        ]
      }]
      include = [...include, {
        model: Classroom_Code.schema(user.schemaname)
      }]
    }

    const classroom = await Classroom.schema(user.schemaname).findOne({
      where: { id: classroomId },
      include
    })
    
    if (user.roleIds.includes(4) && !user.roleIds.includes(1) && !user.roleIds.includes(5)) {
      if (!user.ProfessorId) {
        throw new APIError("Este professor não existe.");
      }

      if (classroom.ProfessorId !== user.ProfessorId) {
        throw new APIError("Você só pode acessar as suas salas de aula.")
      }
    }

    if (user.roleIds.includes(5) && !user.roleIds.includes(1) && !user.roleIds.includes(4)) {
      if (!user.StudentId) {
        throw new APIError("Este aluno não existe.");
      }

      const getClassroomStudents = await Classroom_Student.schema(user.schemaname).findOne({ where: { StudentId: user.StudentId }, attributes: ['id', 'StudentId'] })

      if (!getClassroomStudents) {
        throw new APIError("Você só pode acessar as suas salas de aula.");
      }
    }

    if (user.roleIds.includes(4)) {
      classroom.changed('updatedAt', true)
      await classroom.update({
        updatedAt: new Date()
      })
    }

    return res.json({
      data: classroom,
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
 * Create new classroom
 * @returns {Classroom}
 */
const create = async (req, res, next) => {
  const { active, description='', SubjectId, LevelId, CourseId, courseName, ProfessorId, StudentIds=[] } = req.body;
  const { user } = req;

  const t = await sequelize.transaction();
  try {
    if (!user.roleIds.includes(4)) {
      throw new APIError("Você não tem permissão para criar salas de aula.");
    }

    const hash = crypto.SHA3(user.schemaname + user.id + new Date(), { outputLength: 32 });

    const newClassroom = await Classroom.schema(user.schemaname).create({
      active,
      description,
      SubjectId,
      LevelId,
      CourseId,
      courseName,
      ProfessorId
    }, { transaction: t });

    if (!newClassroom) {
      throw new APIError("Houve um erro ao criar a sala de aula.");
    }

    Classroom_Code.schema(user.schemaname).create({
      ClassroomId: newClassroom.id,
      class_code: hash.toString(),
      path_url: `/matricula/aluno/${user.InstitutionId}/${hash.toString()}`
    })

    if(StudentIds.length > 0) {
      let promises = []
      StudentIds.forEach((element)=>{
        promises.push(
          Classroom_Student.schema(user.schemaname).create({
            active: true,
            ClassroomId: newClassroom.id,
            StudentId: element,
            absences: 0,
            attendance: 0,
            status: '0',
            points: 0.0,
            performance: 0,
            performance_negative: 0
          }).then(()=>{
          }).catch(()=>{
            throw new APIError(`houve um erro ao matricular aluno de id: ${element} na sala de aula.`)
          })
        )
      })

      Promise.all(promises)
    }
    
    await t.commit();

    return res.json({
      success: true,
      message: 'Sala de aula criada com sucesso!'
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
 * Update existing classroom
 * @returns {Classroom}
 */
const update = async (req, res, next) => {
  const { description, SubjectId, LevelId, CourseId, courseName } = req.body;
  const { classroomId } = req.params;
  const { user } = req;

  const u = await sequelize.transaction();
  try {
    const classroom = await Classroom.schema(user.schemaname).findOne({ where: { id: classroomId } })

    if (!user.roleIds.includes(4) && user.ProfessorId !== classroom.ProfessorId) {
      throw new APIError("Você não possui permissão para atualizar esta sala de aula.");
    }

    const updatedClassroom = await classroom.update({
      description,
      SubjectId,
      LevelId,
      CourseId,
      courseName
    }, { transaction: u });

    if (!updatedClassroom) {
      throw new APIError("Houve um erro ao atualizar a sala de aula.");
    }

    u.commit();

    return res.json({
      success: true,
      message: "Sala de aula atualizada com sucesso!"
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
 * Get classroom list.
 * @returns {Classroom[]}
 */
const list = async (req, res, next) => {
  const { limit = 20, page = 1, active = true, ProfessorId } = req.query;
  const { user } = req;
  const offset = 0 + (parseInt(page) - 1) * limit;

  try {
    // role === 1 || 
    if (!user.roleIds.some(role => role === 4 || role === 5)) {
      throw new APIError("Você não tem permissão para acessar este local.");
    }

    if (!ProfessorId) {
      throw new APIError("Parâmetro \"ProfessorId\" é obrigatório.");
    }

    if (!!ProfessorId) {
      const getProfessor = await Professor.schema(user.schemaname).findOne({ where: { id: ProfessorId }, attributes: ['id', 'UserId'] })

      if (!getProfessor) {
        throw new APIError("Este professor não existe.");
      }

      if (!user.roleIds.includes(1) && user.roleIds.includes(4) && user.id != getProfessor.UserId) {
        throw new APIError("Você só pode acessar as suas disciplinas.");
      }
    }

    const classrooms = await Classroom.schema(user.schemaname).findAndCountAll({
      where: ProfessorId ? {
        active,
        ProfessorId
      } : {
          active
        },
      include: [
        { model: Level },
        { model: Subject, include: [{ model: Grade }] },
        { model: Course },
        { model: Classroom_Code.schema(user.schemaname) }
      ],
      attributes: {
        include: [
          [
            sequelize.literal(`(SELECT COUNT(*) FROM ${user.schemaname}."Classroom_Students" AS "classroomStudent" WHERE "classroomStudent"."ClassroomId" = "Classroom".id AND "classroomStudent".active = true)`),
            'classroomStudentCount'
          ]
        ]
      },
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    if (!classrooms) {
      throw new APIError("Não foi possível trazer a lista de cursos.")
    }

    return res.json({
      success: true,
      data: classrooms.rows,
      pagination: {
        limit,
        offset,
        page: parseInt(page),
        count: classrooms.count,
        nextPage: offset + limit <= classrooms.count
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
  const { user } = req;
  const { classroomId } = req.params;

  const t = await sequelize.transaction();
  try {
    const classroom = await Classroom.schema(user.schemaname).findOne({ where: { id: classroomId } })

    if(!classroom) 
      throw new APIError("Sala de Aula não encontrada.");

    if (!user.roleIds.includes(4) && user.ProfessorId !== classroom.ProfessorId) {
      throw new APIError("Você não possui permissão para encerrar esta sala de aula.");
    }

    const deletedClassroom = await classroom.update({
      active: false
    }, { transaction: t });

    if (!deletedClassroom) {
      throw new APIError("Houve um erro ao encerrar a sala de aula.");
    }

    t.commit();

    return res.json({
      success: true,
      message: "Sala de aula encerrada com sucesso!"
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

const reactivate = async (req, res, next) => {
  const { user } = req;
  const { classroomId } = req.params;

  const t = await sequelize.transaction();
  try {
    const classroom = await Classroom.schema(user.schemaname).findOne({ where: { id: classroomId } })

    if(!classroom) 
      throw new APIError("Sala de Aula não encontrada.");

    if (!user.roleIds.includes(4) && user.ProfessorId !== classroom.ProfessorId) {
      throw new APIError("Você não possui permissão para reativar esta sala de aula.");
    }

    const reactivatedClassroom = await classroom.update({
      active: true
    }, { transaction: t });

    if (!reactivatedClassroom) {
      throw new APIError("Houve um erro ao reativar a sala de aula.");
    }

    t.commit();

    return res.json({
      success: true,
      message: "Sala de aula reativada com sucesso!"
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

const createCode = async (req, res, next) => {
  const { user } = req;
  const { classroomId } = req.params;

  const hash = crypto.SHA3(user.schemaname + user.id + new Date(), { outputLength: 32 });

  const t = await sequelize.transaction();
  try {
    const classroom = await Classroom.schema(user.schemaname).findOne({ where: { id: classroomId }, attributes: ['id', 'ProfessorId'] })

    if(!classroom) 
      throw new APIError("Sala de Aula não encontrada.");
    if (!user.roleIds.includes(4) && user.ProfessorId !== classroom.ProfessorId) {
      throw new APIError("Você não possui permissão para criar códigos de acesso a esta sala de aula.");
    }

    const createdCode = await Classroom_Code.schema(user.schemaname).create({
      ClassroomId: classroomId,
      class_code: hash.toString(),
      path_url: `/matricula/aluno/${user.InstitutionId}/${hash.toString()}`
    })

    if(!createdCode)
      throw new APIError("Houve um erro ao criar código de acesso a sala de aula.");

    await t.commit();
    return res.json({
      success: true,
      message: "Código de acesso a sala de aula criado com sucesso!",
      data: createdCode
    });
  } catch (err) {
    await r.rollback();
    return res.status(err.status ? err.status : 500).json({
      success: false,
      message: err.message,
      status: err.status ? err.status : 500
    })
  }
}

const listClassroomCodes = async (req, res, next) => {
  const { user } = req;
  const { classroomId } = req.params;
  try {
    const classroom = await Classroom.schema(user.schemaname).findOne({ where: { id: classroomId }, attributes: ['id', 'ProfessorId'] })

    if(!classroom) 
      throw new APIError("Sala de Aula não encontrada.");
    if (!user.roleIds.includes(4) && user.ProfessorId !== classroom.ProfessorId) {
      throw new APIError("Você não possui permissão para listar chaves de acesso a esta sala de aula.");
    }
    const foundCodes = await Classroom_Code.schema(user.schemaname).findAll({
      where: { ClassroomId: classroomId }
    })
    if(!foundCodes)
      throw new APIError("Houve um erro ao listar códigos de acesso a sala de aula.");

    return res.json({
      success: true,
      data: foundCodes
    });
  } catch (err) {
    return res.status(err.status ? err.status : 500).json({
      success: false,
      message: err.message,
      status: err.status ? err.status : 500
    })
  }
}

const listClassroomFeed = async (req, res, next) => {
  const { classroomId } = req.params;
  const { limit = 20, page = 1 } = req.query;
  const { user } = req;
  const offset = 0 + (parseInt(page) - 1) * limit;
  try {
    const classroomsFeeds = await Classroom_Feed.schema(user.schemaname).findAll({
      where: {
        ClassroomId: classroomId
      },
      include: [
        {
          model: Classroom_Feed_Inquiry.schema(user.schemaname),
          include: [
            {
              model: Classroom_Feed_Inquiry_Option.schema(user.schemaname),
              attributes: 
              [
                ['id', 'value'],
                ['option', 'label']
              ]
            },
          ],
          attributes: {
            include: [
              [
                sequelize.literal(`(SELECT "ClassroomFeedInquiryOptionId" FROM  "${user.schemaname}"."Classroom_Feed_Inquiry_Answers" AS "answers" WHERE "answers"."ClassroomFeedInquiryId" = "Classroom_Feed_Inquiry".id AND "answers"."StudentId" = ${user.StudentId} LIMIT 1)`),
                'responded'
              ],
              [
                sequelize.literal(`(SELECT "id" FROM "${user.schemaname}"."Classroom_Feed_Inquiry_Options" AS "options" WHERE "options"."ClassroomFeedInquiryId" = "Classroom_Feed_Inquiry".id AND "options"."correct" = TRUE LIMIT 1)`),
                'correctOption'
              ],
            ], 
            exclude: [
              'createdAt', 'updatedAt', 'ClassroomFeedId', 'ProfessorId'
            ]
          }
        },
        {
          model: Professor.schema(user.schemaname),
          attributes: ['UserId'],
          include: [
            {
              model: User,
              attributes: ['name', 'photo', 'profession'],
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
            }
          ]
        },
        {
          model: File,
          attributes: ['id', 'url_storage', 'type', 'name']
        }
      ],
      attributes: {
        include: [
          [
            sequelize.literal(`(SELECT COUNT("id") FROM ${user.schemaname}."Classroom_Feed_Comments" AS "feedComment" WHERE "feedComment"."ClassroomFeedId" = "Classroom_Feed".id AND "father" IS NULL)`),
            'commentCount'
          ]
        ]
      },
      order: [['updatedAt', 'DESC']],
      limit,
      offset
    });

    if (!classroomsFeeds) {
      throw new APIError("Não foi possível trazer a lista de cursos.")
    }
    return res.json({
      success: true,
      data: classroomsFeeds,
      pagination: {
        limit,
        offset,
        page: parseInt(page),
        count: classroomsFeeds.length,
        nextPage: offset + limit <= classroomsFeeds.length
      }
    })
  } catch (err) {
    return res.status(err.status ? err.status : 500).json({
      message: err.message,
      success: false,
      status: err.status ? err.status : 500
    });
  }
}

/**
 * create classroom feed.
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
 */
const createClassroomFeed = async (req, res, next) => {
  const { title, content, content_type, video_url, FileId, inquiry } = req.body;
  const { user } = req;
  const { classroomId } = req.params;

  const createDOMPurify = require('dompurify');
  const { JSDOM } = require('jsdom');

  const t = await sequelize.transaction();
  try {
    if (!user.ProfessorId) 
      throw new APIError("Usuário não é professor.");

    const getClassroom = await Classroom.schema(user.schemaname).findByPk(classroomId)
    if (!getClassroom) 
      throw new APIError("Esta sala de aula não existe.");

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
    if (content) {
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

    const createFeed = await Classroom_Feed.schema(user.schemaname).create({
      ClassroomId: classroomId,
      content_type: content_type,
      title,
      content: normalized,
      video_url: video_url,
      FileId: FileId,
      ProfessorId: user.ProfessorId
    }, { transaction: t });

    if (!createFeed) {
      throw new APIError("Houve um erro ao criar feed.");
    }

    if (content_type == "pesquisa") {
      const createInquiry = await Classroom_Feed_Inquiry.schema(user.schemaname).create({
        ClassroomFeedId: createFeed.id,
        ProfessorId: user.ProfessorId,
        type: inquiry.type,
        question: inquiry.question
      }, { transaction: t });

      if (!createInquiry) {
        throw new APIError("Houve um erro ao criar questionário.");
      }

      let promises = []
      inquiry.options.forEach((element) => {
        promises.push(
          Classroom_Feed_Inquiry_Option.schema(user.schemaname).create({
            ClassroomFeedInquiryId: createInquiry.id,
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

const updateClassroomFeed = async (req, res, next) => {
  const { feedId } = req.params;
  const { title, content, video_url, FileId, inquiry } = req.body;
  const { user } = req;

  const createDOMPurify = require('dompurify');
  const { JSDOM } = require('jsdom');

  const u = await sequelize.transaction();
  try {
    let update = {};
    const feedFound = await Classroom_Feed.schema(user.schemaname).findByPk(feedId)

    if (!feedFound)
      throw new APIError("Feed não encontrado.");

    if (!user.ProfessorId) 
      throw new APIError("Usuário não é professor.");

    if (feedFound.ProfessorId !== user.ProfessorId && !user.isAdmin)
      throw new APIError("Você não tem permissão para atualizar este Feed.");

    if (FileId) {
      const deleteFile = await File.findByPk(feedFound.FileId);
      File.deleteAndDestroy(deleteFile);
      update.FileId = FileId;
    }

    if (inquiry) {
      const editInquiry = await Classroom_Feed_Inquiry.schema(user.schemaname).findOne({
        where: {
          ClassroomFeedId: feedId
        }
      });
      if (!editInquiry) throw new APIError("Questionário a ser editado não encontrado.");
      const updatedInquiry = await editInquiry.update({
        question: inquiry.question
      }, { transaction: u });

      if (!updatedInquiry) throw new APIError("Houve um erro ao atualizar questionário.");
    }

    if(video_url) update.video_url = video_url;
    if(title) update.title = title;
    if (content) {
      const window = new JSDOM('').window;
      const DOMPurify = createDOMPurify(window);

      update.content = DOMPurify.sanitize(content);
    }

    const updatedFeed = await feedFound.update(update, { transaction: u });

    if (!updatedFeed)
      throw new APIError("Houve um erro ao atualizar Feed.");

    await u.commit();

    return res.json({
      message: "Feed atualizado com sucesso!",
      data: updatedFeed,
      success: true,
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

const createClassroomFeedComment = async (req, res, next) => {
  const { feedId } = req.params;
  const { content, CommentId } = req.body;
  const { user } = req;
  const t = await sequelize.transaction();
  try {
    if (!user.ProfessorId && !user.StudentId) 
      throw new APIError("Usuário não é estudante e nem professor.");

    if (CommentId) {
      const commentFound = await Classroom_Feed_Comment.schema(user.schemaname).findByPk(CommentId)

      if (!commentFound)
        throw new APIError("Comentário não encontrado.");

      if (commentFound.father)
        throw new APIError("Não é possível criar este comentário nesta profundidade.");
    } else {
      const feedFound = await Classroom_Feed.schema(user.schemaname).findByPk(feedId)

      if (!feedFound)
        throw new APIError("Feed não encontrado.");
    }

    const userInfo = await User.findOne({
      where: {
        id: user.id
      }, 
      attributes: ['id', 'name', 'username', 'photo']
    })

    const createComment = await Classroom_Feed_Comment.schema(user.schemaname).create({
      ClassroomFeedId: feedId,
      StudentId: user.StudentId,
      ProfessorId: user.ProfessorId,
      content,
      father: CommentId,
      UserId: user.id 
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

const updateClassroomFeedComment = async (req, res, next) => {
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

    const commentFound = await Classroom_Feed_Comment.schema(user.schemaname).findByPk(commentId)
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

const removeClassroomFeedComments = async (req, res, next) => {
  const { commentId } = req.params;
  const { user } = req;
  const d = await sequelize.transaction();
  try {
    const commentFound = await Classroom_Feed_Comment.schema(user.schemaname).findByPk(commentId)
    if (!commentFound)
      throw new APIError("Comentário não encontrado.");
    if (user.id != commentFound.UserId)
      throw new APIError("Você não possui permissão para remover comentário.");

    const nestedFound = await Classroom_Feed_Comment.schema(user.schemaname).findAll({
      where: { father: commentId }
    })
    if(nestedFound) {
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
    }

    const deletedComment = await commentFound.destroy({}, { transaction: d });

    if (!deletedComment)
      throw new APIError("Houve um erro ao remover comentário.");

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

const listClassroomFeedComments = async (req, res, next) => {
  const { feedId } = req.params;
  const { limit = 20, page = 1 } = req.query;
  const { user } = req;
  const offset = 0 + (parseInt(page) - 1) * limit;

  try {
    const feedFound = await Classroom_Feed.schema(user.schemaname).findByPk(feedId)
    if (!feedFound)
      throw new APIError("Feed não encontrado.");

    const foundComments = await Classroom_Feed_Comment.schema(user.schemaname).findAndCountAll({
      where: {
        ClassroomFeedId: feedId,
        father: null
      },
      include: [
        { model: User, attributes: ['id', 'name', 'username', 'photo'] }
      ],
      attributes: {
        include: [
          [
            sequelize.literal(`(SELECT COUNT("id") FROM ${user.schemaname}."Classroom_Feed_Comments" AS "feedComment" WHERE "feedComment"."father" = "Classroom_Feed_Comment".id)`),
            'commentCount'
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

const listNestedFeedComments = async (req, res, next) => {
  const { commentId } = req.params;
  const { limit = 20, page = 1 } = req.query;
  const { user } = req;
  const offset = 0 + (parseInt(page) - 1) * limit;

  try {
    const commentFound = await Classroom_Feed_Comment.schema(user.schemaname).findByPk(commentId)
    if (!commentFound)
      throw new APIError("Comentário não encontrado.");

    const foundComments = await Classroom_Feed_Comment.schema(user.schemaname).findAndCountAll({
      where: {
        father: commentId
      },
      include: [
        { model: User, attributes: ['id', 'name', 'username', 'photo'] }
      ],
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

const createInquiryOption = async (req, res, next) => {
  const { option, correct } = req.body;
  const { inquiryId } = req.params;
  const { user } = req;
  const t = await sequelize.transaction();
  try {
    const foundInquiry = await Classroom_Feed_Inquiry.schema(user.schemaname).findByPk(inquiryId);

    if (!foundInquiry) throw new APIError("Questionário não encontrado.");

    if (!user.ProfessorId) 
      throw new APIError("Usuário não é professor.");

    if (foundInquiry.ProfessorId !== user.ProfessorId) throw new APIError("Você não tem permissão para criar uma resposta para este questionário.");

    const createdInquiryOption = await Classroom_Feed_Inquiry_Option.schema(user.schemaname).create({
      ClassroomFeedInquiryId: inquiryId,
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

const removeInquiryOption = async (req, res, next) => {
  const { optionId } = req.params;
  const { user } = req;
  const d = await sequelize.transaction();
  try {
    if (!user.ProfessorId) 
      throw new APIError("Usuário não é professor.");

    const foundInquiryOption = await Classroom_Feed_Inquiry_Option.schema(user.schemaname).findByPk(optionId);
    if (!foundInquiryOption) throw new APIError("Resposta de questionário não encontrado.");

    const foundInquiry = await Classroom_Feed_Inquiry.schema(user.schemaname).findByPk(foundInquiryOption.ClassroomFeedInquiryId);
    if (!foundInquiry) throw new APIError("Questionário não encontrado.");
    if (foundInquiry.ProfessorId !== user.ProfessorId) throw new APIError("Você não tem permissão para criar uma resposta para este questionário.");

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

const viewClassroomInquiryPercentage = async (req, res) => {
  const { inquiryId } = req.params;
  const { user } = req;
  try {
    const foundPercentage = await Classroom_Feed_Inquiry_Option.schema(user.schemaname).findAll({
      where: { ClassroomFeedInquiryId: inquiryId },
      attributes: {
        include: [
          [
            sequelize.literal(`(SELECT COUNT("id") FROM "${user.schemaname}"."Classroom_Feed_Inquiry_Answers" as "answer" WHERE "answer"."ClassroomFeedInquiryOptionId" = "Classroom_Feed_Inquiry_Option".id)`),
            'voteCount'
          ],
        ], 
        exclude: ['createdAt', 'updatedAt', 'correct', 'ClassroomFeedInquiryId']
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

const createInquiryAnswer = async (req, res, next) => {
  const { optionId } = req.params;
  const { user } = req;
  const t = await sequelize.transaction();
  let toRollback = true;
  try {
    if (!user.StudentId) 
      throw new APIError("Estudante não encontrado.");

    const foundInquiry = await Classroom_Feed_Inquiry.schema(user.schemaname).findOne({
      include: [
        { model: Classroom_Feed_Inquiry_Option.schema(user.schemaname), where: { id: optionId } },
      ]
    });
    if (!foundInquiry) throw new APIError("Resposta de questionário não encontrado.");

    const foundAnswer = await Classroom_Feed_Inquiry_Answer.schema(user.schemaname).findOne({
      where: { StudentId: user.StudentId, ClassroomFeedInquiryId: foundInquiry.id },
      attributes: ['id']
    })
    if(foundAnswer) throw new APIError("Pesquisa não pode ser respondida mais de 1 vez.");

    const createdInquiryAnswer = await Classroom_Feed_Inquiry_Answer.schema(user.schemaname).create({
      ClassroomFeedInquiryId: foundInquiry.id,
      ClassroomFeedInquiryOptionId: optionId,
      StudentId: user.StudentId,
    }, { transaction: t });

    if (!createdInquiryAnswer) throw new APIError("Houve um erro ao tentar salvar resposta.");
    
    await t.commit();

    if(foundInquiry.type === 'votacao') {
      const foundPercentage = await Classroom_Feed_Inquiry_Option.schema(user.schemaname).findAll({
        where: { ClassroomFeedInquiryId: foundInquiry.id },
        attributes: {
          include: [
            [
              sequelize.literal(`(SELECT COUNT("id") FROM "${user.schemaname}"."Classroom_Feed_Inquiry_Answers" as "answer" WHERE "answer"."ClassroomFeedInquiryOptionId" = "Classroom_Feed_Inquiry_Option".id)`),
              'voteCount'
            ],
          ], 
          exclude: ['createdAt', 'updatedAt', 'correct', 'ClassroomFeedInquiryId']
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
        correct: foundInquiry.Classroom_Feed_Inquiry_Options[0].correct,
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

const listInquiryAnswer = async (req, res, next) => {
  const { inquiryId } = req.params;
  const { user } = req;

  try {
    if (!user.ProfessorId) 
      throw new APIError("Professor não encontrado.");

    const foundInquiry = await Classroom_Feed_Inquiry.schema(user.schemaname).findAll({
      where: { id: inquiryId },
      include: [
        { model: Classroom_Feed_Inquiry_Option.schema(user.schemaname), include: [{ model: Classroom_Feed_Inquiry_Answer.schema(user.schemaname) }] },
      ]
    });
    if (!foundInquiry) throw new APIError("Questionário não encontrado.");

    if (foundInquiry[0].ProfessorId !== user.ProfessorId && !user.isAdmin) {
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


/*
* @body type -> "exercicio", "teste", "trabalho"
*/
// inserir tipo de atividade "ensine"
const createActivity = async (req, res, next) => {
  const { classroomId } = req.params;
  const { user } = req;
  const { active=false, type, title, deadline, timer, description, total_score=0, ActivityDatabaseId=null } = req.body;
  const t = await sequelize.transaction();
  try {
    if (!user.ProfessorId) 
      throw new APIError("Usuário não é professor.");

    const getClassroom = await Classroom.schema(user.schemaname).findByPk(classroomId)
    if (!getClassroom) 
      throw new APIError("Esta sala de aula não existe.");

    if(getClassroom.ProfessorId !== user.ProfessorId)
      throw new APIError("Você não possui permissão para criar atividades nesta sala de aula.");

    let editTimer = timer;
    let editScore = total_score;
    switch(type) {
      case "exercicio":
        editTimer = null;
        editScore=0;
        break;
      case "trabalho":
        editTimer = null;
        if(editScore === 0)
          throw new APIError("Trabalho precisa valer nota.");
        break;
      case "teste":
        let validaTimer = /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!!editTimer) {
          if(!validaTimer.test(editTimer) || editTimer === '00:00')
            throw new APIError("Timer Inválido, digite novamente.");
        } else {
          throw new APIError("Teste precisa de tempo de duração.");
        }
        if(editScore === 0)
          throw new APIError("Teste precisa valer nota.");
        break;
      default: 
        throw new APIError("Tipo de atividade invalido.");
    }

    const createdActivity = await Activity.schema(user.schemaname).create({
      ClassroomId: classroomId,
      active,
      type,
      title,
      deadline,
      timer: editTimer,
      description,
      total_score: editScore,
      ActivityDatabaseId
    }, { transaction: t });

    if (!createdActivity) throw new APIError("Houve um erro ao tentar criar atividade.");

    await t.commit();

    return res.json({
      data: createdActivity,
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

const updateActivity = async (req, res, next) => {
  const { activityId } = req.params;
  const { user } = req;
  const { active, title, deadline, timer, description, total_score } = req.body;
  const u = await sequelize.transaction();
  try {
    if(!user.ProfessorId) 
      throw new APIError("Usuário não é professor.");

    const foundActivity = await Activity.schema(user.schemaname).findOne({
      where: {id: activityId},
      attributes: ['id', 'ClassroomId', 'type', 'active']
    })
    if(!foundActivity) 
      throw new APIError("Atividade não existe.");
    const foundClassroom = await Classroom.schema(user.schemaname).findOne({
      where: {id: foundActivity.ClassroomId},
      attributes: ['id', 'ProfessorId']
    })
    if(!foundClassroom) 
      throw new APIError("Esta sala de aula não existe.");
    if(foundClassroom.ProfessorId !== user.ProfessorId)
      throw new APIError("Você não possui permissão para remover esta atividade.");

    let update = {}
    update = {...update, active}
    if(!!title) update = {...update, title}
    if(!!deadline) update = {...update, deadline}
    if(!!description) update = {...update, description}
    switch(foundActivity.type) {
      case "exercicio":
        break;
      case "trabalho":
        if(!!total_score) {
          if(total_score <= 0)
            throw new APIError("Trabalho precisa valer nota.");
          update = {...update, total_score}
        }
        break;
      case "teste":
        let validaTimer = /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!!timer) {
          if(!validaTimer.test(timer) || timer === '00:00')
            throw new APIError("Timer Inválido, digite novamente.");
          update = {...update, timer}
        }
        if(total_score === 0)
          throw new APIError("Teste precisa valer nota.");
        update = {...update, total_score}
        break;
      default: 
        throw new APIError("Tipo de atividade invalido.");
    }

    const updatedActivity = await foundActivity.update(update, {transaction: u})
    if(!updatedActivity)
      throw new APIError("Houve um erro ao tentar remover a atividade.");
    
    await u.commit();
    return res.json({
      data: updatedActivity,
      success: true,
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

const deleteActivity = async (req, res, next) => {
  const { activityId } = req.params;
  const { user } = req;
  const d = await sequelize.transaction();
  try {
    if(!user.ProfessorId) 
      throw new APIError("Usuário não é professor.");

    const foundActivity = await Activity.schema(user.schemaname).findOne({
      where: {id: activityId},
      attributes: ['id', 'ClassroomId']
    })
    if(!foundActivity) 
      throw new APIError("Atividade não existe.");
    const foundClassroom = await Classroom.schema(user.schemaname).findOne({
      where: {id: foundActivity.ClassroomId},
      attributes: ['id', 'ProfessorId']
    })
    if(!foundClassroom) 
      throw new APIError("Esta sala de aula não existe.");
    if(foundClassroom.ProfessorId !== user.ProfessorId)
      throw new APIError("Você não possui permissão para remover esta atividade.");

    const foundResult = await Activity_Result.schema(user.schemaname).findOne({
      where: {ActivityId: activityId}, attributes: ['id']
    })
    if(foundResult)
      throw new APIError("Não é possível remover atividade que apresenta respostas.");

    const deletedActivity = await foundActivity.destroy({}, {transaction: d});
    if(!deletedActivity)
      throw new APIError("Houve um erro ao tentar remover a atividade.");
    
    await d.commit();
    return res.json({
      message: "Atividade removida com sucesso!",
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

const listActivitiesProfessor = async (req, res, next) => {
  const { classroomId } = req.params;
  const { type = null } = req.query;
  const { user } = req;
  try {
    const getClassroom = await Classroom.schema(user.schemaname).findByPk(classroomId)
    if (!getClassroom) 
      throw new APIError("Esta sala de aula não existe.");

    if (!user.ProfessorId) 
      throw new APIError("Usuário não é professor.");
    if(user.ProfessorId !== getClassroom.ProfessorId)
      throw new APIError("Você não possui permisão de visualizar as ativividades desta sala de aula.");

    let where = {
      ClassroomId: classroomId
    }

    if (!!type) {
      where = {...where, type}
    }

    const foundActivities = await Activity.schema(user.schemaname).findAll({
      where,
      attributes: {
        include: [
          [
            sequelize.literal(`(SELECT COUNT(id) FROM ${user.schemaname}."Activity_Results" AS "results" WHERE "results"."ActivityId" = "Activity".id)`),
            'ResponseCount'
          ],
          [
            sequelize.literal(`(SELECT COUNT(id) FROM ${user.schemaname}."Activity_Questions" AS "questions" WHERE "questions"."ActivityId" = "Activity".id)`),
            'questionCount'
          ],
        ]
      },
      order: [['createdAt', 'DESC']],
    });

    if (!foundActivities) throw new APIError("Houve um erro ao listar atividades da sala de aula.");

    return res.json({
      data: foundActivities,
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

const listActivitiesStudent = async (req, res, next) => {
  const { classroomId } = req.params;
  const { type = null } = req.query;
  const { user } = req;
  try {
    const getClassroom = await Classroom.schema(user.schemaname).findByPk(classroomId)
    if (!getClassroom) 
      throw new APIError("Esta sala de aula não existe.");

    if (!user.StudentId) 
      throw new APIError("Estudante não encontrado.");
    const getClassroomStudent = await Classroom_Student.schema(user.schemaname).findOne({ where: { StudentId: user.StudentId, ClassroomId: classroomId }, attributes: ['id'] })
    if(!getClassroomStudent)
      throw new APIError("Estudante não matriculado na sala de aula.");

    let where = {
      ClassroomId: classroomId,
      active: true
    }

    if (!!type) {
      where = {...where, type}
    }

    const foundActivities = await Activity.schema(user.schemaname).findAll({
      where,
      attributes: {
        include: [
          [
            sequelize.literal(`(SELECT CASE WHEN COUNT(id) > 0 THEN true ELSE false END FROM ${user.schemaname}."Activity_Results" AS "results" WHERE "results"."ActivityId" = "Activity".id AND "results"."StudentId" = ${user.StudentId} AND "results"."finalized" = TRUE LIMIT 1)`),
            'isResponded'
          ],
          [
            sequelize.literal(`(SELECT "student_score" FROM ${user.schemaname}."Activity_Results" AS "results" WHERE "results"."ActivityId" = "Activity".id AND "results"."StudentId" = ${user.StudentId} AND "results"."revised" = TRUE LIMIT 1)`),
            'finalScore'
          ],
          [
            sequelize.literal(`(SELECT COUNT(id) FROM ${user.schemaname}."Activity_Questions" AS "questions" WHERE "questions"."ActivityId" = "Activity".id)`),
            'questionCount'
          ],
        ]
      },
      order: [['createdAt', 'DESC']],
    });

    if (!foundActivities) throw new APIError("Houve um erro ao listar atividades da sala de aula.");

    return res.json({
      data: foundActivities,
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

const getActivityStudent = async (req, res, next) => {
  const { activityId } = req.params;
  const { user } = req;
  // const t = await sequelize.transaction();
  try {
    if (!user.StudentId) 
      throw new APIError("Estudante não encontrado.");

    const foundActivity = await Activity.schema(user.schemaname).findOne({
      where: { id: activityId },
      attributes: {
        exclude: ['createdAt', 'updatedAt'],
        include: [
          [
            sequelize.literal(`(SELECT CASE WHEN COUNT(id) > 0 THEN true ELSE false END FROM ${user.schemaname}."Activity_Results" AS "results" WHERE "results"."ActivityId" = "Activity".id AND "results"."StudentId" = ${user.StudentId} AND "results"."finalized" = TRUE LIMIT 1)`),
            'isResponded'
          ],
          [
            sequelize.literal(`(SELECT "student_score" FROM ${user.schemaname}."Activity_Results" AS "results" WHERE "results"."ActivityId" = "Activity".id AND "results"."StudentId" = ${user.StudentId} AND "results"."revised" = TRUE LIMIT 1)`),
            'finalScore'
          ],
          [
            sequelize.literal(`(SELECT COUNT(id) FROM ${user.schemaname}."Activity_Questions" AS "questions" WHERE "questions"."ActivityId" = "Activity".id)`),
            'questionCount'
          ],
        ]
      }
    });
    if (!foundActivity) throw new APIError("Atividade não encontrada.");
    if (!foundActivity.active) throw new APIError("Atividade não está ativa.");

    const getClassroomStudent = await Classroom_Student.schema(user.schemaname).findOne({ where: { StudentId: user.StudentId, ClassroomId: foundActivity.ClassroomId }, attributes: ['id'] })
    if(!getClassroomStudent)
      throw new APIError("Estudante não matriculado na sala de aula.");

    // await t.commit();
    return res.json({
      data: foundActivity,
      success: true,
    });
  } catch (err) {
    // await t.rollback();
    return res.status(err.status ? err.status : 500).json({
      message: err.message,
      success: false,
      status: err.status ? err.status : 500
    });
  }
}

const beginActivityStudent = async (req, res, next) => {
  const { activityId } = req.params;
  const { user } = req;
  // const t = await sequelize.transaction();
  try {
    if (!user.StudentId) 
      throw new APIError("Estudante não encontrado.");

    const foundActivity = await Activity.schema(user.schemaname).findOne({
      where: { id: activityId},
      include: [
        {
          model: Activity_Question.schema(user.schemaname),
          include: [
            {
              model: File,
              attributes: ['id', 'name', 'type', ['url_storage', 'url']]
            },
            {
              model: Activity_Option.schema(user.schemaname),
              attributes: {
                include: [
                  [
                    sequelize.literal(`(SELECT CASE WHEN COUNT("id") > 0 THEN true ELSE false END FROM "${user.schemaname}"."Activity_Question_Answers" AS "answers" WHERE "answers"."ActivityOptionId" = "Activity_Questions->Activity_Options"."id" AND "answers"."StudentId" = ${user.StudentId} LIMIT 1)`),
                    'isResponded'
                  ],
                ],
                exclude: ['createdAt', 'updatedAt', 'correct', 'ActivityQuestionId']
              }
            },
          ],
          attributes: ['id', 'type', 'question', 'score']
        }
      ],
      attributes: {
        exclude: ['createdAt', 'updatedAt'],
        include: [
          [
            sequelize.literal(`(SELECT CASE WHEN COUNT(id) > 0 THEN true ELSE false END FROM ${user.schemaname}."Activity_Results" AS "results" WHERE "results"."ActivityId" = "Activity".id AND "results"."StudentId" = ${user.StudentId} AND "results"."finalized" = TRUE LIMIT 1)`),
            'isResponded'
          ]
        ]
      }
    });
    if (!foundActivity) throw new APIError("Atividade não encontrada.");
    if (!foundActivity.active) throw new APIError("Atividade não está ativa.");

    const getClassroomStudent = await Classroom_Student.schema(user.schemaname).findOne({ where: { StudentId: user.StudentId, ClassroomId: foundActivity.ClassroomId }, attributes: ['id'] })
    if(!getClassroomStudent)
      throw new APIError("Estudante não matriculado na sala de aula.");
      
    // console.log(foundActivity.deadline)

    if(foundActivity.type === "teste") {
      throw new APIError("Atividades deste tipo não podem ser iniciadas por aqui.");
    }
    if(foundActivity.type === "exercicio") {
      const foundAnswers = await Activity.schema(user.schemaname).findAll({
        where: {id: activityId},
        include: [
          {
            model: Activity_Question_Answer.schema(user.schemaname),
            where: { StudentId: user.StudentId },
            attributes: ['id', 'ActivityQuestionId', 'ActivityOptionId', 'answer']
          },
        ],
        attributes: ['id']
      })
      let cleanedArray = JSON.parse(JSON.stringify(foundActivity))
      if(!foundAnswers)
        throw new APIError("Houve um erro ao tentar verificar perguntas já respondidas.");
      await cleanedArray.Activity_Questions.forEach((element, index, array)=>{
        array[index].Activity_Question_Student_File = null
        array[index].Activity_Question_Answer = null
        if(!!foundAnswers[0]) {
          for(let i = 0; i< foundAnswers[0].Activity_Question_Answers.length; i++) {
            if(foundAnswers[0].Activity_Question_Answers[i].ActivityQuestionId == element.id) {
              array[index].Activity_Question_Answer = foundAnswers[0].Activity_Question_Answers[i]
            }
          }
        }
      })
  
      const foundResult = await Activity_Result.schema(user.schemaname).findOne({
        where: { StudentId: user.StudentId, ActivityId: activityId }
      })
      if(!foundResult) {
        const createdResult = await Activity_Result.schema(user.schemaname).create({
          ActivityId: activityId,
          StudentId: user.StudentId,
          revised: true,
          finalized: false,
          student_score: 0
        })
        if(!createdResult)
          throw new APIError("Houve um problema ao marcar início da atividade.");
      }
      return res.json({
        data: cleanedArray,
        answers: foundAnswers,
        success: true,
      });
    } else {
      const foundFiles = await Activity.schema(user.schemaname).findAll({
        where: {id: activityId},
        include: [
          {
            model: Activity_Question_Student_File.schema(user.schemaname),
            where: { StudentId: user.StudentId },
            include: [
              {
                model: File,
                attributes: ['id', 'name', 'type', ['url_storage', 'url']]
              }
            ],
            attributes: ['id', 'ActivityQuestionId']
          }
        ],
        attributes: ['id']
      })

      let cleanedArray = JSON.parse(JSON.stringify(foundActivity))
      if(!foundFiles)
        throw new APIError("Houve um erro ao tentar verificar perguntas já respondidas.");
      await cleanedArray.Activity_Questions.forEach((element, index, array)=>{
        array[index].Activity_Question_Student_File = null
        array[index].Activity_Question_Answer = null
        if(!!foundFiles[0]) {
          for(let i = 0; i< foundFiles[0].Activity_Question_Student_Files.length; i++) {
            if(foundFiles[0].Activity_Question_Student_Files[i].ActivityQuestionId == element.id) {
              array[index].Activity_Question_Student_File = foundFiles[0].Activity_Question_Student_Files[i]
            }
          }
        }
      })

      if(Date.parse(foundActivity.deadline) < Date.now()) {
        return res.json({
          data: foundActivity,
          message: "Não foi possível iniciar atividade, data final de realização da atividade expirada",
          success: true,
        });
      } else {
        // let startActivity = ''
        // let endActivity = ''
        // let timer = foundActivity.timer
        // let timerSplit = !!timer ? timer.split(':') : ['00', '00']
        const foundResult = await Activity_Result.schema(user.schemaname).findOne({
          where: { StudentId: user.StudentId, ActivityId: activityId }
        })
        if(!foundResult) {
          const createdResult = await Activity_Result.schema(user.schemaname).create({
            ActivityId: activityId,
            StudentId: user.StudentId,
            revised: false,
            finalized: false,
            student_score: 0
          })
          if(!createdResult)
            throw new APIError("Houve um problema ao marcar início da atividade.");
          // startActivity = createdResult.createdAt;
          // let end = new Date(createdResult.createdAt)
          // end.setHours(end.getHours() + Number(timerSplit[0]))
          // end.setMinutes(end.getMinutes() + Number(timerSplit[1]))
          // endActivity = end;
        } 
        // else {
        //   startActivity = foundResult.createdAt;
        //   let end = new Date(foundResult.createdAt)
        //   end.setHours(end.getHours() + Number(timerSplit[0]))
        //   end.setMinutes(end.getMinutes() + Number(timerSplit[1]))
        //   endActivity = end;
        // }
    
        // await t.commit();
        return res.json({
          data: cleanedArray,
          // startActivity,
          // endActivity,
          success: true,
        });
      }
    }
  } catch (err) {
    // await t.rollback();
    return res.status(err.status ? err.status : 500).json({
      message: err.message,
      success: false,
      status: err.status ? err.status : 500
    });
  }
}

const beginActivityTeste = async (req, res, next) => {
  const { activityId } = req.params;
  const { user } = req;
  // const t = await sequelize.transaction();
  try {
    if (!user.StudentId) 
      throw new APIError("Estudante não encontrado.");
    const foundActivity = await Activity.schema(user.schemaname).findOne({
      where: { id: activityId },
      include: [
        {
          model: Activity_Question.schema(user.schemaname),
          attributes: ['id', 'type']
        }
      ],
      attributes: {
        exclude: ['createdAt', 'updatedAt'],
        include: [
          [
            sequelize.literal(`(SELECT CASE WHEN COUNT(id) > 0 THEN true ELSE false END FROM ${user.schemaname}."Activity_Results" AS "results" WHERE "results"."ActivityId" = "Activity".id AND "results"."StudentId" = ${user.StudentId} AND "results"."finalized" = TRUE LIMIT 1)`),
            'isResponded'
          ]
        ]
      }
    });
    if (!foundActivity) throw new APIError("Atividade não encontrada.");
    if (!foundActivity.active) throw new APIError("Atividade não está ativa.");

    const getClassroomStudent = await Classroom_Student.schema(user.schemaname).findOne({ where: { StudentId: user.StudentId, ClassroomId: foundActivity.ClassroomId }, attributes: ['id'] })
    if(!getClassroomStudent)
      throw new APIError("Estudante não matriculado na sala de aula.");
    
    if(foundActivity.type !== "teste") {
      throw new APIError("Atividades deste tipo não podem ser iniciadas por aqui.");
    }

    const foundAnswers = await Activity.schema(user.schemaname).findAll({
      where: {id: activityId},
      include: [
        {
          model: Activity_Question_Answer.schema(user.schemaname),
          where: { StudentId: user.StudentId },
          attributes: ['id', 'ActivityQuestionId', 'ActivityOptionId', 'answer']
        },
      ],
      attributes: ['id']
    })
    let cleanedArray = JSON.parse(JSON.stringify(foundActivity))
    if(!foundAnswers)
      throw new APIError("Houve um erro ao tentar verificar perguntas já respondidas.");
    await cleanedArray.Activity_Questions.forEach((element, index, array)=>{
      array[index].Activity_Question_Student_File = null
      array[index].Activity_Question_Answer = null
      if(!!foundAnswers[0]) {
        for(let i = 0; i< foundAnswers[0].Activity_Question_Answers.length; i++) {
          if(foundAnswers[0].Activity_Question_Answers[i].ActivityQuestionId == element.id) {
            array[index].Activity_Question_Answer = foundAnswers[0].Activity_Question_Answers[i]
          }
        }
      }
    })
    
    if(Date.parse(foundActivity.deadline) < Date.now()) {
      return res.json({
        data: foundActivity,
        message: "Não foi possível iniciar atividade, data final de realização da atividade expirada",
        success: true,
      });
    } else {
      let startActivity = ''
      let endActivity = ''
      let timer = foundActivity.timer
      let timerSplit = !!timer ? timer.split(':') : ['00', '00']
      const foundResult = await Activity_Result.schema(user.schemaname).findOne({
        where: { StudentId: user.StudentId, ActivityId: activityId }
      })
      if(!foundResult) {
        const createdResult = await Activity_Result.schema(user.schemaname).create({
          ActivityId: activityId,
          StudentId: user.StudentId,
          revised: true,
          finalized: false,
          student_score: 0
        })
        if(!createdResult)
          throw new APIError("Houve um problema ao marcar início da atividade.");
        startActivity = createdResult.createdAt;
        let end = new Date(createdResult.createdAt)
        end.setHours(end.getHours() + Number(timerSplit[0]))
        end.setMinutes(end.getMinutes() + Number(timerSplit[1]))
        endActivity = end;
      } else {
        startActivity = foundResult.createdAt;
        let end = new Date(foundResult.createdAt)
        end.setHours(end.getHours() + Number(timerSplit[0]))
        end.setMinutes(end.getMinutes() + Number(timerSplit[1]))
        endActivity = end;
      }
  
      // await t.commit();
      return res.json({
        data: cleanedArray,
        startActivity,
        endActivity,
        success: true,
      });
    }
  } catch (err) {
    // await t.rollback();
    return res.status(err.status ? err.status : 500).json({
      message: err.message,
      success: false,
      status: err.status ? err.status : 500
    });
  }
}

const beginActivityQuestion = async (req, res, next) => {
  const { activityId, questionId } = req.params;
  const { user } = req;

  try{
    const foundResult = await Activity_Result.schema(user.schemaname).findOne({
      where: { StudentId: user.StudentId, ActivityId: activityId },
      attributes: ['id', 'finalized']
    })
    if(!foundResult)
      throw new APIError("Atividade não foi iniciada pelo estudante.");
    if(foundResult.finalized)
      throw new APIError("Atividade já foi finalizada pelo estudante.");

    const foundQuestion = await Activity_Question.schema(user.schemaname).findOne({
      where: {
        id: questionId
      },
      include: [
        {
          model: Activity_Option.schema(user.schemaname),
          attributes: {
            include: [
              [
                sequelize.literal(`(SELECT CASE WHEN COUNT("id") > 0 THEN true ELSE false END FROM "${user.schemaname}"."Activity_Question_Answers" AS "answers" WHERE "answers"."ActivityOptionId" = "Activity_Options"."id" AND "answers"."StudentId" = ${user.StudentId} LIMIT 1)`),
                'isResponded'
              ],
            ],
            exclude: ['createdAt', 'updatedAt', 'correct', 'ActivityQuestionId']
          }
        },
      ],
      attributes: ['id', 'type', 'question', 'score', 'timer', 'ActivityId']
    })
    if(!foundQuestion)
      throw new APIError("Questão não foi encontrada.");

    let cleanedObject = JSON.parse(JSON.stringify(foundQuestion))

    const foundAnswer = await Activity_Question_Answer.schema(user.schemaname).findOne({
      where: { StudentId: user.StudentId, ActivityQuestionId: questionId },
      attributes: ['id', 'ActivityOptionId', 'answer', 'createdAt']
    })

    let startQuestion = '';
    if(foundAnswer) {
      cleanedObject.Activity_Question_Answer = foundAnswer;
      startQuestion = foundAnswer.createdAt
    } else {
      cleanedObject.Activity_Question_Answer = null;
      const createdAnswer = await Activity_Question_Answer.schema(user.schemaname).create({
        ActivityId: foundQuestion.ActivityId,
        ActivityQuestionId: questionId,
        StudentId: user.StudentId,
        revised: 2,
        correct: false,
        question_score: 0,
        answer: null,
        ActivityOptionId: null
      })
      if(!createdAnswer)
        throw new APIError("Houve um erro ao marcar início da resolução da questão.");
      else 
        startQuestion = createdAnswer.createdAt
    }

    let endQuestion = '';
    if(!!foundQuestion.timer) {
      let timer = foundQuestion.timer
      let timerSplit = !!timer ? timer.split(':') : ['00', '00']
      let end = new Date(startQuestion)
      end.setHours(end.getHours() + Number(timerSplit[0]))
      end.setMinutes(end.getMinutes() + Number(timerSplit[1]))
      endQuestion = end;
    }

    return res.json({
      data: cleanedObject,
      startQuestion,
      endQuestion,
      success: true,
    });

  } catch (err) {
    // await t.rollback();
    return res.status(err.status ? err.status : 500).json({
      message: err.message,
      success: false,
      status: err.status ? err.status : 500
    });
  }
}

const finalizeActivityQuestion = async (req, res, next) => {
  const { activityId, questionId } = req.params;
  const { user } = req;
  const { optionId } = req.body;
  const u = await sequelize.transaction();

  try{
    const foundQuestion = await Activity_Question.schema(user.schemaname).findOne({
      where: { id: questionId, ActivityId: activityId },
      attributes: ['id', 'timer', 'score']
    })
    if(!foundQuestion)
      throw new APIError("Questão não encontrada.");

    const foundAnswer = await Activity_Question_Answer.schema(user.schemaname).findOne({
      where: { StudentId: user.StudentId, ActivityQuestionId: questionId },
      attributes: ['id', 'ActivityOptionId', 'answer', 'createdAt']
    })
    if(!foundAnswer)
      throw new APIError("Questão não foi iniciada.");

    const foundOption = await Activity_Option.schema(user.schemaname).findOne({
      where: { id: optionId, ActivityQuestionId: questionId },
      attributes: ['correct']
    })
    if(!foundOption)
      throw new APIError("Resposta não foi encontrada.");
    
    if(!!foundQuestion.timer) {
      let time = foundQuestion.timer.split(':');
      let timeout = add(foundAnswer.createdAt, {
        hours: parseInt(time[0]),
        minutes: parseInt(time[1])
      })

      if(isBefore(timeout, Date.now())) 
        throw new APIError("Tempo limite de envio da atividade atingido.")
    }

    const updatedAnswer = await foundAnswer.update({
      revised: 2,
      correct: foundOption.correct,
      question_score: foundOption.correct ? foundQuestion.score : 0,
      ActivityOptionId: optionId
    }, {transaction: u})
    if(!updatedAnswer)
      throw new APIError("Houve um erro ao tentar registrar a resposta.")

    await u.commit();
    return res.json({
      success: true,
      message: "Resposta registrada com sucesso!"
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

const getActivityProfessor = async (req, res, next) => {
  const { user } = req;
  const { activityId } = req.params;

  try {
    if (!user.ProfessorId) 
      throw new APIError("Usuário não é professor.");

    const foundClassroom = await Classroom.schema(user.schemaname).findOne({
      include: [
        {model: Activity.schema(user.schemaname), where: {id: activityId}, attributes: ['type']}
      ],
      attributes: ['id', 'ProfessorId']
    });
    if (!foundClassroom) throw new APIError("Atividade não encontrada.");

    if(foundClassroom.ProfessorId !== user.ProfessorId)
      throw new APIError("Você não possui permisão de visualizar esta atividade.");

    const foundActivity = await Activity.schema(user.schemaname).findOne({
      where: { id: activityId },
      include: [
        {model: Activity_Question.schema(user.schemaname), attributes: ['id', 'type', 'FileId', 'question', 'score'], include: [
        {model: Activity_Option.schema(user.schemaname), attributes: ['id', 'option', 'correct']},
        {model: File, attributes: ['id', 'name', 'url_storage']}
        ]}
      ],
      attributes: {
        include: [
          [
            sequelize.literal(`(SELECT COUNT(id) FROM ${user.schemaname}."Activity_Results" AS "results" WHERE "results"."ActivityId" = ${activityId})`),
            'ResponseCount'
          ],
        ]
      },
    })

    if(!foundActivity)
      throw new APIError("Houve um erro ao tentar recuperar informações da atividade.");

    return res.json({
      data: foundActivity,
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

/*
* @body type -> "envio", "escolha", "escrita"
*/
const createActivityQuestion = async (req, res, next) => {
  const { activityId } = req.params;
  const { user } = req;
  const { FileId, type, timer=null, question, score=0, options=[] } = req.body;
  const t = await sequelize.transaction();
  try {
    if(!question && !FileId) throw new APIError("Campo \"question\" ou campo \"FileId\" precisam ser enviados.");

    if (!user.ProfessorId) 
      throw new APIError("Usuário não é professor.");

    const foundClassroom = await Classroom.schema(user.schemaname).findOne({
      include: [
        {model: Activity.schema(user.schemaname), where: {id: activityId}, attributes: ['type', 'active']}
      ],
      attributes: ['id', 'ProfessorId']
    });
    if (!foundClassroom) throw new APIError("Atividade não encontrada.");

    if(foundClassroom.ProfessorId !== user.ProfessorId)
      throw new APIError("Você não possui permisão de criar pergunta nesta atividade.");
    
    if(!!foundClassroom.Activities[0].active) {
      throw new APIError("Só podem ser criadas questões em atividades não ativas.");
    }

    if (!!FileId) {
      const fileFound = await File.findOne({
        where: { id: FileId },
        attributes: ['id']
      })

      if (!fileFound) {
        throw new APIError("Arquivo não encontrado.");
      }
    }

    let editScore = score;
    if(type === "escolha") {
      if(foundClassroom.Activities[0].type === "trabalho") 
        throw new APIError("Questões de multipla escolha não podem ser criadas em trabalhos.");
      else if(foundClassroom.Activities[0].type === "exercicio") {
        editScore = 0;
      } else {
        if(editScore === 0)
          throw new APIError("Questão de teste precisa valer nota.");
      }
    } else {
      if(foundClassroom.Activities[0].type !== "trabalho") 
        throw new APIError("Questões de envio ou escrita não podem ser criadas em testes ou exercícios.");
      if(editScore === 0)
        throw new APIError("Questão de trabalho precisa valer nota.");
    }

    const createdQuestion = await Activity_Question.schema(user.schemaname).create({
      ActivityId: activityId,
      FileId,
      type,
      timer,
      question,
      score: editScore
    }, {transaction: t})

    if(!createdQuestion)
      throw new APIError("Não foi possível criar questão.");
    if(type === "escolha" && options.length > 0) {
      let promises = []
      options.forEach((element) => {
        promises.push(
          Activity_Option.schema(user.schemaname).create({
            ActivityQuestionId: createdQuestion.id,
            option: element.option,
            correct: element.correct
          })
        )
      })
      Promise.all(promises).then(() => {
      }).catch(() => {
        throw new APIError("Houve um erro ao criar opção de resposta da pergunta.");
      })
    }

    await t.commit();

    return res.json({
      data: createdQuestion,
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

const updateActivityQuestion = async (req, res, next) => {
  const { activityQuestionId } = req.params;
  const { user } = req;
  const { FileId, question, timer=null, score, options=[] } = req.body;

  const u = await sequelize.transaction();
  try {
    if (!user.ProfessorId) 
      throw new APIError("Usuário não é professor.");

    const foundQuestion = await Activity_Question.schema(user.schemaname).findByPk(activityQuestionId)
    if(!foundQuestion) throw new APIError("Pergunta não encontrada.");

    const foundClassroom = await Classroom.schema(user.schemaname).findOne({
      include: [
        {model: Activity.schema(user.schemaname), attributes: ['type'], where: { id: foundQuestion.ActivityId }}
      ],
      attributes: ['id', 'ProfessorId']
    });
    if (!foundClassroom) throw new APIError("Atividade não encontrada.");

    if(foundClassroom.ProfessorId !== user.ProfessorId)
      throw new APIError("Você não possui permisão de editar pergunta nesta atividade.");

    let update = {}
    if(!!FileId) {
      const fileFound = await File.findOne({
        where: { id: FileId },
        attributes: ['id']
      })

      if (!fileFound) {
        throw new APIError("Arquivo não encontrado.");
      }
      update.FileId = FileId;
    }
    if(!!question) update.question = question;
    if(!!timer) update.timer = timer;

    if(foundClassroom.Activities[0].type !== "exercicio") {
      if(score) update.score = score;
    }

    const updatedQuestion = await foundQuestion.update(update, {transaction: u});
    if(!updatedQuestion) 
      throw new APIError("Houve um erro ao tentar atualizar atividade.");

    if(options.length > 0) {
      let promises = []
      options.forEach(async (element) => {
        if (!!element.id) {
          const foundOption = await Activity_Option.schema(user.schemaname).findByPk(element.id)
          if(foundOption)
            promises.push(
              foundOption.update({
                option: element.option
              })
            )
        } else {
          promises.push(
            Activity_Option.schema(user.schemaname).create({
              option: element.option,
              correct: element.correct,
              ActivityQuestionId: foundQuestion.id
            })
          )
        }
      })
      Promise.all(promises).then(() => {
      }).catch(() => {
        throw new APIError("Houve um erro ao editar opções de resposta da pergunta.");
      })
    }

    await u.commit();

    return res.json({
      data: updatedQuestion,
      success: true,
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

const deleteActivityQuestion = async (req, res, next) => {
  const { activityQuestionId } = req.params;
  const { user } = req;

  const d = await sequelize.transaction();
  try {
    if (!user.ProfessorId) 
      throw new APIError("Usuário não é professor.");

    const foundQuestion = await Activity_Question.schema(user.schemaname).findByPk(activityQuestionId)
    if(!foundQuestion) throw new APIError("Pergunta não encontrada.");

    const foundClassroom = await Classroom.schema(user.schemaname).findOne({
      include: [
        {model: Activity.schema(user.schemaname), attributes: ['type', 'active'], where: { id: foundQuestion.ActivityId }}
      ],
      attributes: ['id', 'ProfessorId']
    });
    if (!foundClassroom) throw new APIError("Atividade não encontrada.");

    if(foundClassroom.ProfessorId !== user.ProfessorId)
      throw new APIError("Você não possui permisão de editar pergunta nesta atividade.");

    if(!!foundClassroom.Activities[0].active) {
      throw new APIError("Só podem ser removidas questões em atividades não ativas.");
    }

    const deletedQuestion = await foundQuestion.destroy({}, { transaction: d })
    if(!deletedQuestion) throw new APIError("Houve um erro ao remover a pergunta.");

    await d.commit();

    return res.json({
      message: "Pergunta excluida com sucesso!",
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

const getActivityQuestionProfessor = async (req, res, next) => {
  const { questionId } = req.params;
  const { user } = req;

  try {
    if (!user.ProfessorId) 
      throw new APIError("Usuário não é professor.");

    const foundQuestion = await Activity_Question.schema(user.schemaname).findOne({
      where: { id: questionId },
      attributes: { exclude: ['createdAt', 'updatedAt'] },
      include: [
        {
          model: Activity_Option.schema(user.schemaname),
          attributes: ['id', 'option', 'correct']
        },
        {
          model: File,
          attributes: ['id', 'name']
        }
      ]
    })
    if (!foundQuestion) throw new APIError("Questão não encontrada.");

    const foundClassroom = await Classroom.schema(user.schemaname).findOne({
      include: [
        {
          model: Activity.schema(user.schemaname),
          attributes: ['id', 'type'],
          where: {id: foundQuestion.ActivityId}
        }
      ],
      attributes: ['id', 'ProfessorId']
    });
    if (!foundClassroom) throw new APIError("Atividade não encontrada.");

    if(foundClassroom.ProfessorId !== user.ProfessorId)
      throw new APIError("Você não possui permisão de visualizar esta atividade.");

    return res.json({
      data: foundQuestion,
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

// endpoint apresenta mesmas informações de getActivityStudent
// const getActivityQuestionStudent = async (req, res, next) => {
// // lista questão, opçoes e resposta se tiver
// }

const createActivityOption = async (req, res, next) => {
  const { questionId } = req.params;
  const { user } = req;
  const { correct, option } = req.body;

  const t = await sequelize.transaction();
  try {
    if (!user.ProfessorId) 
      throw new APIError("Usuário não é professor.");

    const foundClassroom = await Classroom.schema(user.schemaname).findOne({
      include: [
        {model: Activity.schema(user.schemaname), attributes: ['id'], include: [
          {model: Activity_Question.schema(user.schemaname), attributes: ['type'], where: { id: questionId }}
        ]}
      ],
      attributes: ['id', 'ProfessorId']
    });
    if (!foundClassroom) throw new APIError("Atividade não encontrada.");

    if(foundClassroom.ProfessorId !== user.ProfessorId)
      throw new APIError("Você não possui permisão de criar opções de resposta nesta atividade.");

    if(foundClassroom.Activities[0].Activity_Questions[0].type !== "escolha")
      throw new APIError("Opções de resposta não podem ser criadas neste tipo de questão.");

    const createdOption = await Activity_Option.schema(user.schemaname).create({
      ActivityQuestionId: questionId,
      option,
      correct
    }, { transaction: t })
    if(!createdOption)
      throw new APIError("Houve um erro ao criar opção de resposta da pergunta.");
    await t.commit();
    return res.json({
      data: createdOption,
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

const deleteActivityOption = async (req, res, next) => {
  const { optionId } = req.params;
  const { user } = req;

  const d = await sequelize.transaction();
  try {
    if (!user.ProfessorId) 
      throw new APIError("Usuário não é professor.");

    const foundOption = await Activity_Option.schema(user.schemaname).findByPk(optionId)
    if(!foundOption) 
      throw new APIError("Opção de resposta não encontrada.");

    const foundClassroom = await Classroom.schema(user.schemaname).findOne({
      include: [
        {model: Activity.schema(user.schemaname), attributes: ['id'], include: [
          {model: Activity_Question.schema(user.schemaname), attributes: ['type'], where: { id: foundOption.ActivityQuestionId }}
        ]}
      ],
      attributes: ['id', 'ProfessorId']
    });
    if (!foundClassroom) throw new APIError("Atividade não encontrada.");

    if(foundClassroom.ProfessorId !== user.ProfessorId)
      throw new APIError("Você não possui permisão de remover opção de resposta nesta atividade.");

    const deletedOption = await foundOption.destroy({}, {transaction: d})
    if(!deletedOption)
      throw new APIError("Houve um erro ao remover opção de resposta da pergunta.");
    await d.commit();
    return res.json({
      message: "Opção de resposta removida com sucesso!",
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

/*
* revised -> 0 - precisa de revisão, 1 - revisado, 2 - revisado automaticamente
*/
const answerWithFile = async (req, res, next) => {
  const { user } = req;
  const { questionId } = req.params;
  const { FileIds } = req.body;

  try {
    const foundQuestion = await Activity_Question.schema(user.schemaname).findOne({
      where: { id: questionId }, attributes: ['id', 'type', 'score', 'ActivityId']
    })
    if(!foundQuestion)
      throw new APIError("Questão não encontrada.");
    if(foundQuestion.type !== "envio")
      throw new APIError("Esta questão não pode ser respondida com envio de arquivos.");


    if (!user.StudentId) 
      throw new APIError("Este aluno não existe.");

    const foundActivity = await Activity.schema(user.schemaname).findOne({
      where: {id: foundQuestion.ActivityId}, attributes: ['id', 'ClassroomId', 'deadline', 'timer']
    })
    
    if(!foundActivity)
      throw new APIError("Atividade não encontrada.");
    
    const foundEnrollment = await Classroom_Student.schema(user.schemaname).findOne({
      where: { StudentId: user.StudentId, ClassroomId: foundActivity.ClassroomId }, attributes: ['id'] 
    })
    if(!foundEnrollment)
      throw new APIError("Aluno não está matriculado nesta sala de aula.");

    let promises = []
    FileIds.forEach(element => {
      promises.push(
        File.findOne({
          where: { id: element },
          attributes: ['id', 'UserId']
        }).then((found)=>{
          if(!found)
            throw new APIError(`id: ${element}, Arquivo não encontrado.`)
          if(found.UserId != user.id)
            throw new APIError(`id: ${element}, Arquivo não pertence ao aluno.`)
        }).catch((err)=>{
          throw new APIError(err.message)
        })
      )
    })
    await Promise.all(promises)

    if(Date.parse(foundActivity.deadline) < Date.now()) 
      throw new APIError("Data limite de envio da atividade atingido.")

    const foundQuestionAnswer = await Activity_Question_Answer.schema(user.schemaname).findOne({
      where: {
        StudentId: user.StudentId,
        ActivityQuestionId: questionId
      }
    })
    if(!foundQuestionAnswer) {
      const createdAnswer = await Activity_Question_Answer.schema(user.schemaname).create({
        revised: 0,
        question_score: 0,
        correct: false,
        ActivityOptionId: null,
        answer: null,
        StudentId: user.StudentId,
        ActivityId: foundActivity.id,
        ActivityQuestionId: questionId
      })
      if(!createdAnswer)
        throw new APIError("Houve um erro ao registrar a resposta.");
    }
    
    const foundAnswers = await Activity_Question_Student_File.schema(user.schemaname).findAll({
      where: {
        StudentId: user.StudentId,
        ActivityQuestionId: questionId
      }
    })
    if(!foundAnswers)
      throw new APIError("Houve um erro ao tentar verificar respostas já registradas.")

    foundAnswers.forEach((element)=>{
      element.destroy({})
    })

    let promisesCreate = []
    FileIds.forEach(element => {
      promisesCreate.push(
        Activity_Question_Student_File.schema(user.schemaname).create({
          StudentId: user.StudentId,
          ActivityQuestionId: questionId,
          ActivityId: foundActivity.id,
          FileId: element
        }).catch(()=> {
          throw new APIError("Houve um erro ao registrar arquivo como resposta.")
        })
      )
    })
    await Promise.all(promisesCreate)

    return res.json({
      message: "Resposta registrada com sucesso!",
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

const createActivityAnswer = async (req, res, next) => {
  const { questionId } = req.params;
  const { user } = req;
  const { ActivityOptionId, answer } = req.body;
  const createDOMPurify = require('dompurify');
  const { JSDOM } = require('jsdom');

  const t = await sequelize.transaction();
  try {
    const foundQuestion = await Activity_Question.schema(user.schemaname).findOne({
      where: { id: questionId }, attributes: ['id', 'type', 'score', 'ActivityId']
    })
    if(!foundQuestion)
      throw new APIError("Questão não encontrada.")
    
    const foundActivity = await Activity.schema(user.schemaname).findOne({
      where: {id: foundQuestion.ActivityId}, attributes: ['id', 'ClassroomId', 'deadline', 'timer', 'type']
    })
    
    if(!foundActivity)
      throw new APIError("Atividade não encontrada.");
    if(foundActivity.type === 'teste')
      throw new APIError("Resposta para testes não pode ser registrado aqui.");
    if (!user.StudentId) {
      throw new APIError("Este aluno não existe.");
    }

    const foundEnrollment = await Classroom_Student.schema(user.schemaname).findOne({
      where: { StudentId: user.StudentId, ClassroomId: foundActivity.ClassroomId }, attributes: ['id'] 
    })
    if(!foundEnrollment)
      throw new APIError("Aluno não está matriculado nesta sala de aula.");

    if(foundActivity.type !== "exercicio") {
      const foundResult = await Activity_Result.schema(user.schemaname).findOne({
        where: {
          ActivityId: foundActivity.id, StudentId: user.StudentId
        },
        attributes: ['id', 'createdAt', 'finalized']
      })
      if(!foundResult)
        throw new APIError("Houve um erro ao tentar verificar horário de início de atividade.");
      if(foundResult.finalized)
        throw new APIError("Atividade já finalizada.");

      if(!!foundActivity.timer) {
        let time = foundActivity.timer.split(':');
  
        let timeout = add(foundResult.createdAt, {
          hours: parseInt(time[0]),
          minutes: parseInt(time[1])
        })
  
        if(isBefore(timeout, Date.now())) 
          throw new APIError("Tempo limite de envio da atividade atingido.")
      }
    }

    let toSave = {
      revised: 0,
      question_score: 0,
      correct: false
    }
    if(foundQuestion.type == 'escolha') {
      if(!ActivityOptionId)
        throw new APIError("Campo \"ActivityOptionId\" obrigatório.");
      const foundOption = await Activity_Option.schema(user.schemaname).findOne({
        where: { id: ActivityOptionId }, attributes: ['id', 'correct', 'ActivityQuestionId']
      })
      if(!foundOption)
        throw new APIError("Resposta não encontrada.");
      if(foundOption.ActivityQuestionId != questionId)
        throw new APIError("Resposta não é válida.");
      toSave.correct = foundOption.correct;
      toSave.question_score = foundOption.correct ? foundQuestion.score : 0;
      toSave.revised = 2;
      toSave.ActivityOptionId = ActivityOptionId;
    } else if(foundQuestion.type == 'escrita') {
      if(!answer)
        throw new APIError("Campo \"answer\" obrigatório.")

      const window = new JSDOM('').window;
      const DOMPurify = createDOMPurify(window);

      toSave.answer = DOMPurify.sanitize(answer);
    } else {
      throw new APIError("Esta questão só pode ser respondida com envio de arquivos.");
    }

    if(Date.parse(foundActivity.deadline) < Date.now()) 
      throw new APIError("Data limite de envio da atividade atingido.")

    toSave.StudentId = user.StudentId;
    toSave.ActivityId = foundActivity.id;
    toSave.ActivityQuestionId = questionId;

    const foundAnswer = await Activity_Question_Answer.schema(user.schemaname).findOne({
      where: {
        StudentId: user.StudentId,
        ActivityQuestionId: questionId
      }
    })
    if(foundAnswer) {
      const updatedAnswer = await foundAnswer.update(
        toSave, {transaction: t}
      )
      if(!updatedAnswer)
        throw new APIError("Houve um erro ao atualizar a resposta.");
  
      await t.commit();
      return res.json({
        message: "Resposta editada com sucesso!",
        // data: updatedAnswer,
        success: true,
      });
    } else {
      const createdAnswer = await Activity_Question_Answer.schema(user.schemaname).create(
        toSave, {transaction: t}
      )
      if(!createdAnswer)
        throw new APIError("Houve um erro ao registrar a resposta.");
  
      await t.commit();
      return res.json({
        message: "Resposta registrada com sucesso!",
        // data: createdAnswer,
        success: true,
      });
    }
  } catch (err) {
    await t.rollback();
    return res.status(err.status ? err.status : 500).json({
      message: err.message,
      success: false,
      status: err.status ? err.status : 500
    });
  }
}

const reviseActivityAnswer = async (req, res, next) => {
  const { answerId } = req.params;
  const { user } = req;
  const { revised=1, correct=false, question_score=0 } = req.body
  const u = await sequelize.transaction();
  try {
    if (!user.ProfessorId) 
      throw new APIError("Usuário não é professor.");
    
    const foundAnswer = await Activity_Question_Answer.schema(user.schemaname).findOne({
      where: { id: answerId }, attributes: ['id', 'ActivityId', 'StudentId']
    })
    if (!foundAnswer) 
      throw new APIError("Resposta não encontrada.");

    const foundClassroom = await Classroom.schema(user.schemaname).findOne({
      include: [
        {model: Activity.schema(user.schemaname), attributes: ['id'], where: { id: foundAnswer.ActivityId }}
      ],
      attributes: ['id', 'ProfessorId']
    });
    if (!foundClassroom) throw new APIError("Atividade não encontrada.");

    if(foundClassroom.ProfessorId !== user.ProfessorId)
      throw new APIError("Você não possui permisão de atualizar correção desta resposta.");

    const revisedAnswer = await foundAnswer.update({
      revised,
      question_score,
      correct
    }, {transaction: u})

    if(!revisedAnswer)
      throw new APIError("Houve um erro ao atualizar a correção da resposta.");

    const classroomStudent = await Classroom_Student.schema(user.schemaname).findOne({
      where: {
        StudentId: foundAnswer.StudentId,
        ClassroomId: foundClassroom.id
      }
    })

    const updatedClassroomStudent = await classroomStudent.update({
      points: parseFloat(classroomStudent.points) + parseFloat(question_score)
    })

    await u.commit();
    return res.json({
      data: revisedAnswer,
      success: true,
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

const listActivityAnswers = async (req, res, next) => {
  const { activityId, studentId } = req.params;
  const { user } = req;
  try {
    if (!user.ProfessorId) 
      throw new APIError("Usuário não é professor.");

    const foundClassroom = await Classroom.schema(user.schemaname).findOne({
      include: [
        {model: Activity.schema(user.schemaname), where: {id: activityId}, attributes: ['type']}
      ],
      attributes: ['id', 'ProfessorId']
    });
    if (!foundClassroom) throw new APIError("Atividade não encontrada.");

    if(foundClassroom.ProfessorId !== user.ProfessorId)
      throw new APIError("Você não possui permisão de visualizar respostas desta atividade.");

    const foundAnswers = await Activity_Question.schema(user.schemaname).findAll({
      where: {ActivityId: activityId, 
        [Op.or]: [
          {'$Activity_Question_Answers.StudentId$': studentId},
          {'$Activity_Question_Student_Files.StudentId$': studentId}
        ]
      },
      include: [
        {
          model: Activity_Question_Answer.schema(user.schemaname),
          include: [
            {
              model: Activity_Option.schema(user.schemaname),
              attributes: ['id', 'option']
            }
          ],
          where: {
            StudentId: studentId
          },
          required: false,
          attributes: ['id', 'answer', 'ActivityOptionId', 'revised', 'correct', 'question_score']
        },
        {
          model: Activity_Question_Student_File.schema(user.schemaname),
          where: {
            StudentId: studentId
          },
          include: [
            {
              model: File, attributes: ['id', 'name', 'url_storage', 'type']
            }
          ],
          required: false
        }
      ],
      order: [['createdAt','ASC']]
    })

    if(!foundAnswers)
      throw new APIError("Houve um erro ao listar respostas para a atividade.");

    const foundResult = await Activity_Result.schema(user.schemaname).findOne({
      where: {
        StudentId: studentId,
        ActivityId: activityId
      },
      attributes: ['id']
    })

    return res.json({
      data: foundAnswers,
      ResultId: foundResult.id,
      // scoreSum: foundAnswers.reduce((a, b) => a + (b['Activity_Question_Answers'][0]['question_score'] || 0), 0),
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

const finalizeActivity = async (req, res, next) => {
  const { activityId } = req.params;
  const { user } = req;
  const u = await sequelize.transaction();
  try {
    if (!user.StudentId) {
      throw new APIError("Este aluno não existe.");
    }
    const foundResult = await Activity_Result.schema(user.schemaname).findOne({
      where: { StudentId: user.StudentId, ActivityId: activityId }
    })
    if (!foundResult) {
      throw new APIError("Não há registro de início de atividade pelo aluno.");
    }
    if(foundResult.finalized)
      throw new APIError("Atividade já foi finalizada anteriormente.");

    const foundActivity = await Activity.schema(user.schemaname).findOne({
      where: { id: activityId }, attributes: ['id', 'deadline', 'timer', 'ClassroomId']
    })
    
    if(!foundActivity)
      throw new APIError("Atividade não encontrada.")
      
    if(Date.parse(foundActivity.deadline) < Date.now()) 
      throw new APIError("Data limite de envio da atividade atingido.")
 
    let student_score = 0; 
    if(!!foundActivity.timer) {
      let time = foundActivity.timer.split(':');
      let timeout = add(foundResult.createdAt, {
        hours: parseInt(time[0]),
        minutes: parseInt(time[1])
      })

      if(isBefore(timeout, Date.now())) 
        throw new APIError("Tempo limite de envio da atividade atingido.")
        
      const foundAnswers = await Activity_Question_Answer.schema(user.schemaname).findAll({
        where: {StudentId: user.StudentId, ActivityId: activityId}, attributes: ['id', 'question_score']
      })
      if(!foundAnswers)
        throw new APIError("Houve um problema ao tentar encontrar as respostas da atividade.");
      
      if(foundAnswers.length > 0) {
        foundAnswers.forEach((element)=>{
          student_score += parseFloat(element.question_score);
        })
      }
    }

    const classroomStudent = await Classroom_Student.schema(user.schemaname).findOne({
      where: {
        StudentId: user.StudentId,
        ClassroomId: foundActivity.ClassroomId
      }
    })

    const updatedClassroomStudent = await classroomStudent.update({
      points: parseFloat(classroomStudent.points) + parseFloat(student_score === 0 ? 1 : student_score)
    })

    const updatedResult = await foundResult.update({
      student_score,
      finalized: true
    }, {transaction: u})
    if(!updatedResult)
      throw new APIError("Houve um problema ao tentar finalizar a atividade.");

    await u.commit();
    return res.json({
      message: "Resolução de atividade enviada com sucesso!",
      data: updatedResult,
      success: true,
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

const updateActivityResult = async (req, res, next) => {
  const { resultId } = req.params;
  const { user } = req;
  const { revised=true, student_score=null } = req.body;
  const u = await sequelize.transaction();
  try {
    if (!user.ProfessorId) 
      throw new APIError("Usuário não é professor.");

    const foundResult = await Activity_Result.schema(user.schemaname).findByPk(resultId);
    if(!foundResult)
      throw new APIError("Resultado não encontrado.");

    const foundClassroom = await Classroom.schema(user.schemaname).findOne({
      include: [
        {model: Activity.schema(user.schemaname), where: {id: foundResult.ActivityId}, attributes: ['type']}
      ],
      attributes: ['id', 'ProfessorId']
    });
    if (!foundClassroom) throw new APIError("Atividade não encontrada.");

    if(foundClassroom.ProfessorId !== user.ProfessorId)
      throw new APIError("Você não possui permisão de editar resultados nesta atividade.");
  
    let updateScore = 0;
    if(!student_score) {
      const foundAnswers = await Activity_Question_Answer.schema(user.schemaname).findAll({
        where: {StudentId: foundResult.StudentId, ActivityId: foundResult.ActivityId}, attributes: ['id', 'question_score']
      })
      if(!foundAnswers)
        throw new APIError("Houve um problema ao tentar encontrar as respostas da atividade.");
      if(foundAnswers.length > 0) {
        foundAnswers.forEach((element)=>{
          updateScore += parseInt(element.question_score);
        })
      }
    } else {
      updateScore = student_score;
    }

    const updatedResult = await foundResult.update({
      revised,
      student_score: updateScore
    }, {transaction: u})
    if(!updatedResult)
      throw new APIError("Houve um erro ao tentar atualizar resultado de atividade.");

    await u.commit();
    return res.json({
      data: updatedResult,
      success: true,
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

const listResultsToRevise = async (req, res, next) => {
  const { user } = req;
  const { classroomId } = req.params;
  const { limit = 20, page = 1 } = req.query;
  const offset = 0 + (parseInt(page) - 1) * limit;
  try {
    if (!user.ProfessorId) 
      throw new APIError("Usuário não é professor.");

    const foundClassroom = await Classroom.schema(user.schemaname).findOne({
      where: {id: classroomId},
      attributes: ['id', 'ProfessorId']
    });
    if (!foundClassroom) throw new APIError("Atividade não encontrada.");

    if(foundClassroom.ProfessorId !== user.ProfessorId)
      throw new APIError("Você não possui permisão de visualizar resultados nesta atividade.");
    
    const foundResults = await Activity.schema(user.schemaname).findAndCountAll({
      where: {ClassroomId: classroomId},
      include: [
        {
          model: Activity_Result.schema(user.schemaname),
          where: {finalized: true, revised: false},
          include: [
            {
              model: Student.schema(user.schemaname),
              attributes: ['UserId'],
              include: [
                {
                  model: User,
                  attributes: ['id', 'name', 'email', 'photo']
                }
              ]
            }
          ]
        }
      ],
      attributes: ['id', 'title', 'deadline', 'createdAt'],
      order: [['createdAt', 'ASC']],
      limit,
      offset
    })

    if(!foundResults)
      throw new APIError("Houve um erro ao tentar listar resultados da atividade.");
    return res.json({
      data: foundResults.rows,
      success: true,
      pagination: {
        limit,
        offset,
        page: parseInt(page),
        count: foundResults.count,
        nextPage: offset + limit <= foundResults.count
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

const listActivityResults = async (req, res, next) => {
  const { activityId } = req.params;
  const { user } = req;
  const { limit = 20, page = 1 } = req.query;
  const offset = 0 + (parseInt(page) - 1) * limit;
  try {
    if (!user.ProfessorId) 
      throw new APIError("Usuário não é professor.");

    const foundClassroom = await Classroom.schema(user.schemaname).findOne({
      include: [
        {model: Activity.schema(user.schemaname), where: {id: activityId}, attributes: ['type']}
      ],
      attributes: ['id', 'ProfessorId']
    });
    if (!foundClassroom) throw new APIError("Atividade não encontrada.");

    if(foundClassroom.ProfessorId !== user.ProfessorId)
      throw new APIError("Você não possui permisão de visualizar resultados nesta atividade.");
    
    const foundResults = await Activity_Result.schema(user.schemaname).findAndCountAll({
      where: {
        ActivityId: activityId,
        finalized: true
      },
      include: [
        {
          model: Student.schema(user.schemaname),
          attributes: ['id'],
          include: [
            {
              model: User,
              attributes: ['id', 'name', 'photo']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    })

    if(!foundResults)
      throw new APIError("Houve um erro ao tentar listar resultados da atividade.");

    return res.json({
      data: foundResults.rows,
      success: true,
      pagination: {
        limit,
        offset,
        page: parseInt(page),
        count: foundResults.count,
        nextPage: offset + limit <= foundResults.count
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

const classroomRanking = async (req, res, next) => {
  const { user } = req;
  const { classroomId } = req.params;

  try {
    const foundClassroom = await Classroom.schema(user.schemaname).findOne({
      where: {id: classroomId }, attributes: ['id', 'ProfessorId']
    })
    if(!foundClassroom)
      throw new APIError("Sala de aula não encontrada.");
    
    if (user.ProfessorId !== foundClassroom.ProfessorId && !user.roleIds.includes(1))
    throw new APIError("Você não possui permissão para visualizar ranking de alunos.");

    const foundStudentEnroll = await Classroom_Student.schema(user.schemaname).findAll({
      where: { ClassroomId: classroomId }, attributes: ['id', 'points'],
      include: [
        {
          model: Student.schema(user.schemaname),
          include: [
            {
              model: User,
              attributes: ['id', 'name']
            }
          ],
          attributes: ['id']
        }
      ]
    })

    if(!foundStudentEnroll)
      throw new APIError("Estudante não é matriculado nesta sala de aula.");

    // const foundActivities = await Activity.schema(user.schemaname).findAll({
    //   where: {ClassroomId: classroomId}, attributes: ['id']
    // })
    // if(!foundActivities)
    //   throw new APIError("Houve um problema ao listar atividades da sala de aula.");

    // const activityArray = foundActivities.map((element)=>{
    //   return element.id
    // })
    // const foundResults = await Activity_Result.schema(user.schemaname).findAll({
    //   where: {
    //     ActivityId: activityArray,
    //     finalized: true
    //   },
    //   attributes: [
    //     [sequelize.fn('sum', sequelize.col('student_score')), 'total_amount'],
    //   ],
    //   group: ['Activity_Result.StudentId', 'Student.id', 'Student->User.id'],
    //   include: [
    //     {model: Student.schema(user.schemaname), attributes:['id'], include: [
    //       {model: User, attributes: ['id', 'name', 'photo']}
    //     ]}
    //   ],
    //   order: sequelize.literal('total_amount DESC'),
    // })
    // if(!foundResults)
    //   throw new APIError("Houve um problema ao listar resultados da sala de aula.");

    return res.json({
      data: foundStudentEnroll,
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

const resetActivityResult = async (req, res, next) => {
  const { studentId, activityId } = req.params;
  const { user } = req;
  const d = await sequelize.transaction();
  try {
    const foundClassroom = await Classroom.schema(user.schemaname).findOne({
      include: [
        {model: Activity.schema(user.schemaname), where: {id: activityId}, attributes: ['type', 'active']}
      ],
      attributes: ['id', 'ProfessorId']
    });
    if (!foundClassroom) throw new APIError("Atividade não encontrada.");

    if(foundClassroom.ProfessorId !== user.ProfessorId)
      throw new APIError("Você não possui permisão para reiniciar atividade de aluno.");
    
    if(foundClassroom.Activities[0].type !== "teste") {
      throw new APIError("Só podem ser reiniciadas ativididades do tipo teste.");
    }
    
    const foundResult = await Activity_Result.schema(user.schemaname).findOne({
      where: {
        StudentId: studentId,
        ActivityId: activityId
      }, attributes: ['id']
    })
    if(!foundResult)
      throw new APIError("Estudante não havia começado atividade.");

    const deletedResult = await foundResult.destroy({transaction: d})
    if(!deletedResult)
      throw new APIError("Houve um erro ao tentar reiniciar atividade do estudante.");

    await d.commit();
    return res.json({
      message: "Atividade reiniciada com sucesso!",
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

const createActivityTeach = async (req, res, next) => {
  const { classroomId } = req.params;
  const { user } = req;
  const { description, title, active=true, deadline=null, StudentIds=[]} = req.body;
  const t = await sequelize.transaction();
  const createDOMPurify = require('dompurify');
  const { JSDOM } = require('jsdom');
  try {
    const foundClassroom = await Classroom.schema(user.schemaname).findOne({
      where: {id: classroomId},
      attributes: ['id', 'ProfessorId']
    });
    if (!foundClassroom) throw new APIError("Sala de aula não encontrada.");

    if(foundClassroom.ProfessorId !== user.ProfessorId)
      throw new APIError("Você não possui permisão para criar atividade.");

    let normalized = '';
    const window = new JSDOM('').window;
    const DOMPurify = createDOMPurify(window);
    normalized = DOMPurify.sanitize(description);
    const createdActivity = await Activity_Class_Teach.schema(user.schemaname).create(
      {
        ClassroomId: classroomId,
        title,
        description: normalized,
        active,
        deadline
      }, {transaction: t})
    if(!createdActivity)
      throw new APIError("Houve um erro ao criar a atividade.");

    let promises = []
    StudentIds.forEach((element) => {
      promises.push(
        Activity_Class_Teach_Student.schema(user.schemaname).create({
          ActivityClassTeachId: createdActivity.id,
          StudentId: element,
          sent: false
        })
      )
    })
    Promise.all(promises).then(() => {
    }).catch(() => {
      throw new APIError("Houve um erro ao selecionar os alunos para a atividade.");
    })

    await t.commit();
    return res.json({
      message: "Atividade criada com sucesso!",
      data: createdActivity,
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

const editActivityTeach = async (req, res, next) => {
  const { activityId } = req.params;
  const { user } = req;
  const { description=null, title=null, active=null, deadline=null} = req.body;
  const createDOMPurify = require('dompurify');
  const { JSDOM } = require('jsdom');
  const u = await sequelize.transaction();
  try {
    if(!user.ProfessorId) 
      throw new APIError("Usuário não é professor.");

    const foundActivity = await Activity_Class_Teach.schema(user.schemaname).findOne({
      where: {id: activityId},
      attributes: ['id', 'ClassroomId']
    })
    if(!foundActivity) 
      throw new APIError("Atividade não existe.");

    const foundClassroom = await Classroom.schema(user.schemaname).findOne({
      where: {id: foundActivity.ClassroomId},
      attributes: ['id', 'ProfessorId']
    })
    if(!foundClassroom) 
    throw new APIError("Sala de aula não encontrada.");

    if(foundClassroom.ProfessorId !== user.ProfessorId)
      throw new APIError("Você não possui permissão para atualizar esta atividade.");

    let update = {}
    if(!!title) update = {...update, title}
    if(!!deadline) update = {...update, deadline}
    if(!!description) {
      let normalized = '';
      const window = new JSDOM('').window;
      const DOMPurify = createDOMPurify(window);
      normalized = DOMPurify.sanitize(description);
      update = {...update, description: normalized}
    } 
    if(!!active) update = {...update, active}
    
    const updatedActivity = await foundActivity.update(
      update, {transaction: u})
    if(!updatedActivity)
      throw new APIError("Houve um erro ao tentar atualizar a atividade.");

    await u.commit();
    return res.json({
      message: "Atividade atualizada com sucesso!",
      data: updatedActivity,
      success: true,
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

const addStudentsToActivity = async (req, res, next) => {
  const { activityId } = req.params;
  const { user } = req;
  const { StudentIds=[] } = req.body;
  try {
    if(!user.ProfessorId) 
      throw new APIError("Usuário não é professor.");

    const foundActivity = await Activity_Class_Teach.schema(user.schemaname).findOne({
      where: {id: activityId},
      attributes: ['id', 'ClassroomId']
    })
    if(!foundActivity) 
      throw new APIError("Atividade não existe.");

    const foundClassroom = await Classroom.schema(user.schemaname).findOne({
      where: {id: foundActivity.ClassroomId},
      attributes: ['id', 'ProfessorId']
    })
    if(!foundClassroom) 
    throw new APIError("Sala de aula não encontrada.");

    if(foundClassroom.ProfessorId !== user.ProfessorId)
      throw new APIError("Você não possui permissão para remover esta atividade.");

    let promises = []
    StudentIds.forEach(async (element) => {
      const foundRelation = await Activity_Class_Teach_Student.schema(user.schemaname).findOne({
        where: {
          ActivityClassTeachId: activityId,
          StudentId: element,
        }, attributes: ["id"]
      })
      if(!foundRelation) {
        promises.push(
          Activity_Class_Teach_Student.schema(user.schemaname).create({
            ActivityClassTeachId: activityId,
            StudentId: element,
            sent: false,
            status: 0
          })
        )
      }
    })
    Promise.all(promises).then(() => {
    }).catch(() => {
      throw new APIError("Houve um erro ao selecionar os alunos para a atividade.");
    })

    return res.json({
      message: "Estudantes inseridos com sucesso!",
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

const removeStudentFromActivity = async (req, res, next) => {
  const { activityId, studentId }= req.params;
  const { user } = req;
  const d = await sequelize.transaction();
  try {
    if(!user.ProfessorId) 
      throw new APIError("Usuário não é professor.");

    const foundActivity = await Activity_Class_Teach.schema(user.schemaname).findOne({
      where: {id: activityId},
      attributes: ['id', 'ClassroomId']
    })
    if(!foundActivity) 
      throw new APIError("Atividade não existe.");

    const foundClassroom = await Classroom.schema(user.schemaname).findOne({
      where: {id: foundActivity.ClassroomId},
      attributes: ['id', 'ProfessorId']
    })
    if(!foundClassroom) 
      throw new APIError("Sala de aula não encontrada.");

    if(foundClassroom.ProfessorId !== user.ProfessorId)
      throw new APIError("Você não possui permissão para remover esta atividade para alunos.");

    const foundRelation = await Activity_Class_Teach_Student.schema(user.schemaname).findOne({
      where:{
        ActivityClassTeachId: activityId,
        StudentId: studentId,
      }, attributes: ['id']
    })
    if(!foundRelation)
      throw new APIError("Estudante não estava listado para a atividade.");

    const deletedRelation = await foundRelation.destroy({transaction: d})
    if(!deletedRelation)
      throw new APIError("Houve um erro ao tentar remover a atividade para o estudante.");

    await d.commit();
    return res.json({
      message: "Atividade para o estudante removida com sucesso!",
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

const answerActivityTeach = async (req, res, next) => {
  const { answerId }= req.params;
  const { user } = req;
  const { type, FileId=null, video_url=null } = req.body;
  const t = await sequelize.transaction();
  try {
    if(type == "audio") {
      if(!FileId)
        throw new APIError("Arquivo precisa enviado.");
    } else {
      if(!video_url)
        throw new APIError("Vídeo precisa enviado.");
    }

    const foundRelation = await Activity_Class_Teach_Student.schema(user.schemaname).findOne({
      where:{
        id: answerId
      }, attributes: ['id', 'ActivityClassTeachId', 'status']
    })
    if(!foundRelation)
      throw new APIError("Estudante não precisa fazer esta atividade.");

    if(foundRelation.status !== 0) {
      throw new APIError("Atividade já foi respondida.");
    }

    const foundActivity = await Activity_Class_Teach.schema(user.schemaname).findOne({
      where: {id: foundRelation.ActivityClassTeachId},
      attributes: ['id', 'deadline']
    })
    if(!foundActivity)
      throw new APIError("Informações da atividade não foram encontradas.");
    if(!!foundActivity.deadline) {
      if(Date.parse(foundActivity.deadline) < Date.now()) 
        throw new APIError("Data limite de envio da atividade atingido.")
    }

    const updatedAnswer = await foundRelation.update({
      sent: true,
      status: 2,
      type, 
      FileId,
      video_url
    }, {transaction: t})
    if(!updatedAnswer)
      throw new APIError("Houve um erro ao tentar salvar resposta da atividade.");

    await t.commit();
    return res.json({
      message: "Resposta enviada com sucesso!",
      data: updatedAnswer,
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

const listActivityTeachStudent = async (req, res, next) => {
  const { classroomId } = req.params;
  const { user } = req;
  const { limit = 20, page = 1 } = req.query;
  const offset = 0 + (parseInt(page) - 1) * limit;
  try {
    if(!user.StudentId)
      throw new APIError("Usuário não é estudante.");

    const foundActivities = await Activity_Class_Teach.schema(user.schemaname).findAll({
      where: {ClassroomId: classroomId, active: true},
      attributes: {
        include: [
          [
            sequelize.literal(`(SELECT status FROM "${user.schemaname}"."Activity_Class_Teach_Students" as "answer" WHERE "answer"."ActivityClassTeachId" = "Activity_Class_Teach".id AND "answer"."StudentId" = ${user.StudentId} LIMIT 1)`),
            'status'
          ],
        ]
      },
      limit,
      offset
    })
    if(!foundActivities)
      throw new APIError("Houve um erro ao tentar listar atividades da sala de aula.");
    return res.json({
        data: foundActivities,
        pagination: {
          limit,
          offset,
          page: parseInt(page),
          count: foundActivities.length,
          nextPage: offset + limit <= foundActivities.length
        },
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

const listActivityTeachProfessor = async (req, res, next) => {
  const { classroomId } = req.params;
  const { user } = req;
  const { limit = 20, page = 1 } = req.query;
  const offset = 0 + (parseInt(page) - 1) * limit;

  try {
    if(!user.ProfessorId)
      throw new APIError("Usuário não é professor.");

    const foundActivities = await Activity_Class_Teach.schema(user.schemaname).findAll({
      where: {ClassroomId: classroomId},
      attributes: {
        include: [
          [
            sequelize.literal(`(SELECT COUNT(id) FROM "${user.schemaname}"."Activity_Class_Teach_Students" as "answer" WHERE "answer"."ActivityClassTeachId" = "Activity_Class_Teach".id AND "answer"."status" = 2 LIMIT 1)`),
            'toRevise'
          ],
        ]
      },
      limit,
      offset
    })
    if(!foundActivities)
      throw new APIError("Houve um erro ao tentar listar atividades da sala de aula.");
    return res.json({
        data: foundActivities,
        pagination: {
          limit,
          offset,
          page: parseInt(page),
          count: foundActivities.length,
          nextPage: offset + limit <= foundActivities.length
        },
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

const viewActivity = async (req, res, next) => {
  const { activityId } = req.params;
  const { user } = req;
  try {
    if(!user.ProfessorId) 
      throw new APIError("Usuário não é professor.");

    const foundActivity = await Activity_Class_Teach.schema(user.schemaname).findOne({
      where: {id: activityId}
    })
    if(!foundActivity) 
      throw new APIError("Atividade não existe.");

    const foundClassroom = await Classroom.schema(user.schemaname).findOne({
      where: {id: foundActivity.ClassroomId},
      attributes: ['id', 'ProfessorId']
    })
    if(!foundClassroom) 
      throw new APIError("Sala de aula não encontrada.");

    if(foundClassroom.ProfessorId !== user.ProfessorId)
      throw new APIError("Você não possui permissão para remover esta atividade para alunos.");

    const foundAnswers = await Activity_Class_Teach_Student.schema(user.schemaname).findAll({
      where: {ActivityClassTeachId: activityId},
      include: {
        model: Student.schema(user.schemaname),
        include: {
          model: User,
          attributes: ['id', 'name', 'photo']
        },
        attributes: ['id']
      },
      attributes: ['id', 'sent', 'status']
    })
    if(!foundAnswers)
      throw new APIError("Houve um erro ao tentar listar respostas da atividade.");
    return res.json({
      data: foundActivity,
      students: foundAnswers,
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

const viewActivityAnswersProfessor = async (req, res, next) => {
  const { activityId } = req.params;
  const { user } = req;
  const { status=0 } = req.query;
  const { limit = 20, page = 1 } = req.query;
  const offset = 0 + (parseInt(page) - 1) * limit;
  try {
    if(!user.ProfessorId) 
      throw new APIError("Usuário não é professor.");

    const foundActivity = await Activity_Class_Teach.schema(user.schemaname).findOne({
      where: {id: activityId},
      attributes: ['id', 'ClassroomId']
    })
    if(!foundActivity) 
      throw new APIError("Atividade não existe.");

    const foundClassroom = await Classroom.schema(user.schemaname).findOne({
      where: {id: foundActivity.ClassroomId},
      attributes: ['id', 'ProfessorId']
    })
    if(!foundClassroom) 
      throw new APIError("Sala de aula não encontrada.");

    if(foundClassroom.ProfessorId !== user.ProfessorId)
      throw new APIError("Você não possui permissão para remover esta atividade para alunos.");

    let where = {}
    if(status > 0) {
      where = {...where, status}
    }
    where = {...where, ActivityClassTeachId: activityId}
    const foundAnswers = await Activity_Class_Teach_Student.schema(user.schemaname).findAll({
      where,
      include: [
        {
          model: File,
          attributes: {
            exclude: ['createdAt', 'updatedAt']
          }
        },
        {
          model: Student.schema(user.schemaname),
          include: {
          model: User,
            attributes: ['id', 'name', 'photo']
          },
          attributes: ['id']
        },
      ],
      attributes: {
        exclude: ["StudentId", "ActivityClassTeachId"]
      },
      limit, 
      offset
    })
    if(!foundAnswers)
      throw new APIError("Houve um erro ao tentar listar respostas da atividade.");
    return res.json({
      data: foundAnswers,
      pagination: {
        limit,
        offset,
        page: parseInt(page),
        count: foundAnswers.length,
        nextPage: offset + limit <= foundAnswers.length
      },
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

const viewActivityAnswerStudent = async (req, res, next) => {
  const { activityId }= req.params;
  const { user } = req;
  try {
    if(!user.StudentId)
      throw new APIError("Usuário não é estudante.");
    const foundAnswer = await Activity_Class_Teach_Student.schema(user.schemaname).findOne({
      include: {
        model: File,
        attributes: {
          exclude: ['createdAt', 'updatedAt']
        }
      },
      where:{
        ActivityClassTeachId: activityId,
        StudentId: user.StudentId,
      }
    })
    if(!foundAnswer)
      throw new APIError("Estudante não esta listado para a atividade.");

    return res.json({
      data: foundAnswer,
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

const reviseActivityTeach = async (req, res, next) => {
  const { answerId }= req.params;
  const { user } = req;
  const { approved=false } = req.body;
  const t = await sequelize.transaction();
  const u = await sequelize.transaction();
  try {

    if(!user.ProfessorId)
      throw new APIError("Usuário não é professor.");

    const foundAnswer = await Activity_Class_Teach_Student.schema(user.schemaname).findOne({
      where:{
        id: answerId
      },
      include: {
        model: Student.schema(user.schemaname), 
        include: {
          model: User, attributes: ['name']
        },
        attributes: ['id']
      }, attributes: ['id', 'status', 'type', 'ActivityClassTeachId', 'video_url', 'FileId']
    })
    if(!foundAnswer)
      throw new APIError("Resposta não encontrada.");

    const foundActivity = await Activity_Class_Teach.schema(user.schemaname).findOne({
      where:{
        id: foundAnswer.ActivityClassTeachId
      }, attributes: ['id', 'ClassroomId', 'title']
    })
    if(!foundActivity)
      throw new APIError("Informação da atividade não encontrada.");
    
    const classroomStudent = await Classroom_Student.schema(user.schemaname).findOne({
      where: {
        StudentId: foundAnswer.Student.id,
        ClassroomId: foundActivity.ClassroomId
      }
    })

    if(approved) {
      const createFeed = await Classroom_Feed.schema(user.schemaname).create({
        ClassroomId: foundActivity.ClassroomId,
        content_type: foundAnswer.type,
        title: `Ensine a turma: ${foundActivity.title}.`,
        content: `Feito por ${foundAnswer.Student.User.name}.`,
        video_url: foundAnswer.video_url,
        FileId: foundAnswer.FileId,
        ProfessorId: user.ProfessorId
      }, { transaction: t });
  
      if (!createFeed) {
        throw new APIError("Houve um erro ao criar feed da resposta da atividade.");
      }
  
      const updatedClassroomStudent = await classroomStudent.update({
        performance: parseInt(classroomStudent.performance) + 1
      })
    } else {  
      const updatedClassroomStudent = await classroomStudent.update({
        performance_negative: parseInt(classroomStudent.performance_negative) + 1
      })
    }

    const updatedAnswer = await foundAnswer.update({
      status: approved ? 1 : 3
    }, {transaction: u})
    if(!updatedAnswer)
      throw new APIError("Houve um erro ao tentar salvar resposta da atividade.");

    await t.commit();
    await u.commit();
    return res.json({
      message: "Resposta revisada com sucesso!",
      data: updatedAnswer,
      success: true,
    });
  } catch (err) {
    await t.rollback();
    await u.rollback();
    return res.status(err.status ? err.status : 500).json({
      message: err.message,
      success: false,
      status: err.status ? err.status : 500
    });
  }
}

const editActivityTeachAnswer = async (req, res, next) => {
  const { answerId }= req.params;
  const { user } = req;
  const { type=null, FileId=null, video_url=null } = req.body;
  const u = await sequelize.transaction();
  try {
    const foundAnswer = await Activity_Class_Teach_Student.schema(user.schemaname).findOne({
      where:{
        id: answerId
      },
      attributes: ['id', 'status', 'StudentId', 'ActivityClassTeachId']
    })
    if(!foundAnswer)
      throw new APIError("Resposta não encontrada.");

    if(foundAnswer.StudentId !== user.StudentId)
      throw new APIError("Você não possui permissão para atualizar a resposta de outro aluno.");

    if(foundAnswer.status == 1)
      throw new APIError("Você não pode atualizar uma resposta aceita.");

    if(type == "audio") {
      if(!FileId)
        throw new APIError("Arquivo precisa enviado.");
    } else {
      if(!video_url)
        throw new APIError("Vídeo precisa enviado.");
    }

    const foundActivity = await Activity_Class_Teach.schema(user.schemaname).findOne({
      where:{
        id: foundAnswer.ActivityClassTeachId
      }, attributes: ['id', 'deadline']
    })
    if(!foundActivity)
      throw new APIError("Informação da atividade não encontrada.");
    
    if(!!foundActivity.deadline) {
      if(Date.parse(foundActivity.deadline) < Date.now()) 
        throw new APIError("Data limite de envio da atividade atingido.")
    }

    let update = {status: 2}
    if(!!type) update = {...update, type}
    if(!!FileId) update = {...update, FileId}
    if(!!video_url) update = {...update, video_url}

    const updatedAnswer = await foundAnswer.update(update, {transaction: u})
    if(!updatedAnswer)
      throw new APIError("Houve um erro ao tentar atualizar resposta da atividade.");

    await u.commit();
    return res.json({
      message: "Resposta atualizada com sucesso!",
      data: updatedAnswer,
      success: true,
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

const listClassroomPerformance = async (req, res, next) => {
  const { classroomId } = req.params
  const { user } = req
  try {
    const getClassroomStudents = await Classroom_Student.schema(user.schemaname).findAll({
      where: {
        ClassroomId: classroomId
      },
      include: [
        {
          model: Student.schema(user.schemaname),
          include: [
            {
              model: User,
              attributes: ['id', 'name']
            }
          ]
        }
      ]
    })

    let geralPerformance = [['Aluno', 'Pontuação Positiva']]

    getClassroomStudents.forEach((student) => {
      geralPerformance.push([student.Student.User.name, student.performance])
    })

    let geralPerformanceNegative = [['Aluno', 'Pontuação Negativa']]

    getClassroomStudents.forEach((student) => {
      geralPerformanceNegative.push([student.Student.User.name, student.performance_negative])
    })

    let individualPerformance = []

    getClassroomStudents.forEach((student, index) => {
      individualPerformance[index] = [
        ['Aluno', 'Pontuação Positiva', 'Pontuação Negativa'],
        [student.Student.User.name, student.performance, student.performance_negative]
      ]
    })

    return res.json({
      data: {
        geralPerformance,
        geralPerformanceNegative,
        individualPerformance
      },
      success: true
    })
  } catch (err) {
    return res.status(err.status ? err.status : 500).json({
      message: err.message,
      success: false,
      status: err.status ? err.status : 500
    });
  }
}

export default {
  get,
  create,
  update,
  list,
  remove,
  reactivate,
  createCode,
  listClassroomCodes,
  listClassroomFeed,
  createClassroomFeed,
  updateClassroomFeed,
  createClassroomFeedComment,
  updateClassroomFeedComment,
  removeClassroomFeedComments,
  listClassroomFeedComments,
  listNestedFeedComments,
  createInquiryOption,
  removeInquiryOption,
  createInquiryAnswer,
  listInquiryAnswer,
  createActivity,
  updateActivity,
  deleteActivity,
  listActivitiesProfessor,
  listActivitiesStudent,
  getActivityStudent,
  beginActivityStudent,
  beginActivityTeste,
  beginActivityQuestion,
  finalizeActivityQuestion,
  getActivityProfessor,
  getActivityQuestionProfessor,
  createActivityQuestion,
  updateActivityQuestion,
  deleteActivityQuestion,
  createActivityOption,
  deleteActivityOption,
  createActivityAnswer,
  reviseActivityAnswer,
  listActivityAnswers,
  answerWithFile,
  viewClassroomInquiryPercentage,
  finalizeActivity,
  updateActivityResult,
  listResultsToRevise,
  listActivityResults,
  classroomRanking,
  resetActivityResult,
  createActivityTeach,
  editActivityTeach,
  addStudentsToActivity,
  removeStudentFromActivity,
  answerActivityTeach,
  viewActivity,
  listActivityTeachStudent,
  listActivityTeachProfessor,
  viewActivityAnswersProfessor,
  reviseActivityTeach,
  editActivityTeachAnswer,
  viewActivityAnswerStudent,
  listClassroomPerformance
};
