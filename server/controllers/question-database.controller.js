import db from '../models';
import APIError from '../helpers/APIError';
import { Op } from 'sequelize';
import httpStatus from 'http-status';

const {
  Question_Database_Option,
  Question_Database,
  User_Permission,
  Question_Database_Tag,
  Question_Database_Flag,
  File,
  Classroom,
  Activity,
  Activity_Question,
  Activity_Option,
  Classroom_Student,
  Level,
  Grade,
  Subject,
  Course,
  Tag,
  sequelize
} = db;

// listagem para redator
const list = async (req, res, next) => {
  const { user } = req;
  const { limit = 20, page = 1, LevelId=null, GradeId=null,CourseId=null,SubjectId=null, active = true } = req.query;
  const offset = 0 + (parseInt(page) - 1) * limit;
  try {
    if(!user.roleIds.includes(1) && !user.roleIds.includes(3))
      throw new APIError("Você não possui permissão para acessar este local.");

    const foundPermission = await User_Permission.findOne({
      where: {
        UserId: user.id,
        PermissionId: 1
      }, attributes: ['id']
    })
    if(!foundPermission)
      throw new APIError("Você não possui a permissão especifica para acessar este local.");

    let filter = {}
    if(!!SubjectId) filter = {...filter, SubjectId}
    if(!!LevelId) filter = {...filter, LevelId}
    if(!!GradeId) filter = {...filter, GradeId}
    if(!!CourseId) filter = {...filter, CourseId}
    if(!!active) filter = {...filter, active}
    const foundQuestions = await Question_Database.findAndCountAll({
      where: filter,
      include: [
        {
          model: Question_Database_Option,
          attributes: {
            exclude: ['createdAt', 'updatedAt', 'QuestionDatabaseId']
          },
        },
        {
          model: Level,
          attributes: {
            exclude: ['createdAt', 'updatedAt']
          }
        },
        {
          model: Grade,
          attributes: {
            exclude: ['createdAt', 'updatedAt']
          }
        },
        {
          model: Subject,
          attributes: {
            exclude: ['createdAt', 'updatedAt']
          }
        },
        {
          model: Course,
          attributes: {
            exclude: ['createdAt', 'updatedAt']
          }
        },
        {
          model: File,
          attributes: {
            exclude: ['createdAt', 'updatedAt']
          }
        },
        {
          model: Question_Database_Flag,
          attributes: [
            "id", "FlagId",
            [
              sequelize.literal(`(SELECT "flags"."title" FROM "Flags" AS "flags" WHERE "flags"."id" = "Question_Database_Flags"."FlagId")`),
              "title"
            ]
          ]
        },
        {
          model: Question_Database_Tag,
          attributes: [
            "id", "TagId",
            [
              sequelize.literal(`(SELECT "tags"."title" FROM "Tags" AS "tags" WHERE "tags"."id" = "Question_Database_Tags"."TagId")`),
              "title"
            ]
          ]
        }
      ],
      district: true,
      order: [['createdAt', 'DESC']],
      limit,
      offset
    })
    if(!foundQuestions)
      throw new APIError("Houve um problema ao tentar listar questões do banco.");

    return res.json({
      success: true,
      data: foundQuestions.rows,
      filters: {
        LevelId,
        GradeId,
        CourseId,
        SubjectId,
        active
      },
      pagination: {
        limit,
        offset,
        page: parseInt(page),
        count: foundQuestions.count,
        nextPage: offset + limit <= foundQuestions.count
      }
    })
  } catch (err) {
    return res.status(err.status ? err.status : 500).json({
      success: false,
      message: err.message
    })
  }
};

// listagem em sala de aula
const filteredList = async (req, res, next) => {
  const { user } = req;
  const { classroomId } = req.params;
  const { limit = 20, page = 1, tags = null } = req.query;
  const offset = 0 + (parseInt(page) - 1) * limit;

  try {
    if(!user.ProfessorId)
      throw new APIError("Usuário não é professor.");

    const foundClassroom = await Classroom.schema(user.schemaname).findByPk(classroomId)
    if(!foundClassroom)
      throw new APIError("Sala de aula não encontrada.");
    if(foundClassroom.ProfessorId !== user.ProfessorId)
      throw new APIError("Você não possui permissão para visualizar esta listagem.");

    let filters = { active: true }
    if(!!foundClassroom.SubjectId) filters = {...filters, SubjectId: foundClassroom.SubjectId}
    if(!!foundClassroom.LevelId) filters = {...filters, LevelId: foundClassroom.LevelId}
    if(!!foundClassroom.CourseId) filters = {...filters, CourseId: foundClassroom.CourseId}

    const foundQuestions = await Question_Database.findAll({
      where: filters,
      include: [
        {
          model: Question_Database_Option,
          attributes: {
            exclude: ['createdAt', 'updatedAt', 'QuestionDatabaseId']
          }
        },
        {
          model: File,
          attributes: ['url_storage', 'type', 'name']
        },
        {
          model: Question_Database_Flag,
          where: {
            FlagId: 2
          },
          attributes: [
            "id", "FlagId",
            [
              sequelize.literal(`(SELECT "flags"."title" FROM "Flags" AS "flags" WHERE "flags"."id" = "Question_Database_Flags"."FlagId")`),
              "title"
            ]
          ]
        },
        {
          model: Question_Database_Tag,
          where: !!tags ? { TagId: JSON.parse(tags) } : null,
          attributes: [
            "id", "TagId",
            [
              sequelize.literal(`(SELECT "tags"."title" FROM "Tags" AS "tags" WHERE "tags"."id" = "Question_Database_Tags"."TagId")`),
              "title"
            ]
          ]
        }
      ],
      attributes: {
        exclude: ['createdAt', 'updatedAt', 'active']
      },
      limit,
      offset
    })
    if(!foundQuestions)
      throw new APIError("Houve um problema ao tentar listar questões do banco.");

    return res.json({
      success: true,
      data: foundQuestions,
      filters,
      pagination: {
        limit,
        offset,
        page: parseInt(page),
        count: foundQuestions.length,
        nextPage: offset + limit <= foundQuestions.length
      }
    })
  } catch (err) {
    return res.status(err.status ? err.status : 500).json({
      success: false,
      message: err.message
    })
  }
};

const createQuestion = async (req, res, next) => {
  const { user } = req;
  const { title, description, active=true, FileId, question, LevelId, GradeId, CourseId, SubjectId, options, tags=[], justification, flags=[]} = req.body;
  const createDOMPurify = require('dompurify');
  const { JSDOM } = require('jsdom');
  const t = await sequelize.transaction();
  try {
    if(!user.roleIds.includes(3))
      throw new APIError("Você não possui permissão para acessar este local.");

    const foundPermission = await User_Permission.findOne({
      where: {
        UserId: user.id,
        PermissionId: 1
      }, attributes: ['id']
    })
    if(!foundPermission)
      throw new APIError("Você não possui a permissão especifica para acessar este local.");
    
    if(!!FileId) {
      const foundFile = await File.findByPk(FileId)
      if(!foundFile)
        throw new APIError("Arquivo não encontrado.");
      if(foundFile.UserId !== user.id)
        throw new APIError("Não é possível utilizar um arquivo que não lhe pertence.");
    }

    let normalized = '';
    if (!!justification) {
      const window = new JSDOM('').window;
      const DOMPurify = createDOMPurify(window);

      normalized = DOMPurify.sanitize(justification);
    }

    const createdQuestion = await Question_Database.create({
      title,
      description,
      active,
      FileId,
      question,
      justification: normalized,
      LevelId,
      GradeId,
      CourseId,
      SubjectId
    }, {transaction: t})

    if(!createdQuestion)
      throw new APIError("Houve um erro ao tentar salvar questão.");

    let promises = []
    options.forEach((element)=>{
      promises.push(
        Question_Database_Option.create({
          QuestionDatabaseId: createdQuestion.id,
          description: element.description? element.description: "",
          option: element.option,
          correct: element.correct
        })
      )
    })
    Promise.all(promises).then(() => {
    }).catch(() => {
      throw new APIError("Houve um erro ao criar resposta da questão.");
    })

    let promisesTags = []
    tags.forEach((element)=> {
      promisesTags.push(
        Question_Database_Tag.create({
          TagId:element,
          QuestionDatabaseId: createdQuestion.id,
        })
      )
    })
    Promise.all(promisesTags).then(() => {
    }).catch(() => {
      throw new APIError("Houve um erro ao registrar as tags da questão.");
    })

    let promisesFlags = []
    flags.forEach((element)=> {
      promisesFlags.push(
        Question_Database_Flag.create({
          FlagId:element,
          QuestionDatabaseId: createdQuestion.id,
        })
      )
    })
    Promise.all(promisesFlags).then(() => {
    }).catch(() => {
      throw new APIError("Houve um erro ao registrar as flags da questão.");
    })
    
    await t.commit();

    return res.json({
      success: true,
      message: "Questão criada com sucesso!",
      data: createdQuestion
    })
  } catch (err) {
    await t.rollback();
    return res.status(err.status ? err.status : 500).json({
      success: false,
      message: err.message
    })
  }
};

const updateQuestion = async (req, res, next) => {
  const { user } = req;
  const { questionId } = req.params;
  const { title, description, justification=null, active, FileId, question, LevelId, GradeId, CourseId, SubjectId, options = [], tags = [], flags = []} = req.body;
  const u = await sequelize.transaction();
  const createDOMPurify = require('dompurify');
  const { JSDOM } = require('jsdom');
  try {
    if(!user.roleIds.includes(3))
      throw new APIError("Você não possui permissão para acessar este local.");

    const foundPermission = await User_Permission.findOne({
      where: {
        UserId: user.id,
        PermissionId: 1
      }, attributes: ['id']
    })
    if(!foundPermission)
      throw new APIError("Você não possui a permissão especifica para acessar este local.");

    const foundQuestion = await Question_Database.findByPk(questionId);
    if(!foundQuestion)
      throw new APIError("Houve um erro ao encontrar questão.");

    let toUpdate = {}

    if(!!title) toUpdate = {...toUpdate, title}
    if(!!description) toUpdate = {...toUpdate, description}
    if(!!active) toUpdate = {...toUpdate, active}
    if(!!question) toUpdate = {...toUpdate, question}
    if(!!LevelId) toUpdate = {...toUpdate, LevelId}
    if(!!GradeId) toUpdate = {...toUpdate, GradeId}
    if(!!CourseId) toUpdate = {...toUpdate, CourseId}
    if(!!SubjectId) toUpdate = {...toUpdate, SubjectId}
    if(!!justification) {
      const window = new JSDOM('').window;
      const DOMPurify = createDOMPurify(window);
      let normalized = DOMPurify.sanitize(justification);
      toUpdate = { ...toUpdate, justification: normalized }
    }
    if(!!FileId) {
      const foundFile = await File.findByPk(FileId)
      if(!foundFile)
        throw new APIError("Arquivo não encontrado.");
      if(foundFile.UserId !== user.id)
        throw new APIError("Não é possível utilizar um arquivo que não lhe pertence.");
      toUpdate = {...toUpdate, FileId}
    }

    const updatedQuestion = await foundQuestion.update(toUpdate, {transaction: u})
    if(!updatedQuestion)
      throw new APIError("Houve um erro ao modificar questão.");

    if(options.length > 0) {
      let promises = []
      options.forEach(async (element) => {
        if (!!element.id) {
          const foundOption = await Question_Database_Option.findByPk(element.id)
          if(foundOption)
            promises.push(
              foundOption.update({
                option: element.option,
                correct: element.correct
              })
            )
        } else {
          promises.push(
            Question_Database_Option.create({
              option: element.option,
              correct: element.correct,
              QuestionDatabaseId: foundQuestion.id,
              description: element.description? element.description: "",
            })
          )
        }
      })
      Promise.all(promises).then(() => {
      }).catch(() => {
        throw new APIError("Houve um erro ao editar opções de resposta da pergunta.");
      })
    }

    const findAllTags = await Question_Database_Tag.findAll({
      where: {
        QuestionDatabaseId: foundQuestion.id
      },
      attributes: ['TagId'],
      raw: true
    })

    const tagsIds = findAllTags.map(tag => tag.TagId)

    let differenceToRemove = tagsIds.filter(x => !tags.includes(x));

    let promisesTagsRemove = []
    differenceToRemove.forEach(diff => {
      promisesTagsRemove.push(
        Question_Database_Tag.destroy({
          where: {
            QuestionDatabaseId: foundQuestion.id,
            TagId: diff
          }
        })
      )
    })
    Promise.all(promisesTagsRemove).then(() => {
    }).catch(() => {
      throw new APIError("Houve um erro ao remover as tags da questão.");
    })

    let differenceToAdd = tags.filter(x => !tagsIds.includes(x));

    let promisesTags = []
    differenceToAdd.forEach((element)=> {
      promisesTags.push(
        Question_Database_Tag.create({
          TagId: element,
          QuestionDatabaseId: foundQuestion.id,
        })
      )
    })
    Promise.all(promisesTags).then(() => {
    }).catch(() => {
      throw new APIError("Houve um erro ao adicionar as tags da questão.");
    })

    // aqui começa
    const findAllFlags = await Question_Database_Flag.findAll({
      where: {
        QuestionDatabaseId: foundQuestion.id
      },
      attributes: ['FlagId'],
      raw: true
    })

    const flagsIds = findAllFlags.map(flag => flag.FlagId)

    differenceToRemove = flagsIds.filter(x => !flags.includes(x));
    
    let promisesFlagsRemove = []
    differenceToRemove.forEach(diff => {
      promisesFlagsRemove.push(
        Question_Database_Flag.destroy({
          where: {
            QuestionDatabaseId: foundQuestion.id,
            FlagId: diff
          }
        })
      )
    })
    Promise.all(promisesFlagsRemove).then(() => {
    }).catch(() => {
      throw new APIError("Houve um erro ao remover as flags da questão.");
    })
    
    differenceToAdd = flags.filter(x => !flagsIds.includes(x));

    let promisesFlags = []
    differenceToAdd.forEach((element)=> {
      promisesFlags.push(
        Question_Database_Flag.create({
          FlagId: element,
          QuestionDatabaseId: foundQuestion.id,
        })
      )
    })
    Promise.all(promisesFlags).then(() => {
    }).catch(() => {
      throw new APIError("Houve um erro ao registrar as flags da questão.");
    })

    await u.commit();
    return res.json({
      message: "Questão modificada com sucesso!",
      success: true,
      data: updatedQuestion
    })
  } catch (err) {
    await u.rollback();
    return res.status(err.status ? err.status : 500).json({
      success: false,
      message: err.message
    })
  }
};

const deleteQuestion = async (req, res, next) => {
  const { user } = req;
  const { questionId } = req.params;
  const d = await sequelize.transaction();
  try {
    if(!user.roleIds.includes(3))
      throw new APIError("Você não possui permissão para acessar este local.");

    const foundPermission = await User_Permission.findOne({
      where: {
        UserId: user.id,
        PermissionId: 1
      }, attributes: ['id']
    })
    if(!foundPermission)
      throw new APIError("Você não possui a permissão especifica para acessar este local.");

    const foundQuestion = await Question_Database.findByPk(questionId);
    if(!foundQuestion)
      throw new APIError("Houve um erro ao encontrar questão.");

    const deletedQuestion = foundQuestion.destroy({}, {transaction: d})
    if(!deletedQuestion)
      throw new APIError("Houve um erro ao remover questão.");

    await d.commit();
    return res.json({
      success: true,
      message: "Questão removida com sucesso!"
    })
  } catch (err) {
    await d.rollback();
    return res.status(err.status ? err.status : 500).json({
      success: false,
      message: err.message
    })
  }
};

const createOption = async (req, res, next) => {
  const { user } = req;
  const { questionId } = req.params;
  const { description="", option, correct} = req.body;
  const t = await sequelize.transaction();
  try {
    if(!user.roleIds.includes(3))
      throw new APIError("Você não possui permissão para acessar este local.");

    const foundPermission = await User_Permission.findOne({
      where: {
        UserId: user.id,
        PermissionId: 1
      }, attributes: ['id']
    })
    if(!foundPermission)
      throw new APIError("Você não possui a permissão especifica para acessar este local.");

    const foundQuestion = await Question_Database.findByPk(questionId);
    if(!foundQuestion)
      throw new APIError("Houve um erro ao encontrar questão.");

    const createdOption = await Question_Database_Option.create({
      QuestionDatabaseId: questionId,
      description,
      option,
      correct
    }, {transaction: t})
    if(!createdOption)
      throw new APIError("Houve um erro ao criar opção.");

    await t.commit();
    return res.json({
      success: true,
      data: createdOption,
      message: "Opção criada com sucesso!"
    })
  } catch (err) {
    await t.rollback();
    return res.status(err.status ? err.status : 500).json({
      success: false,
      message: err.message
    })
  }
};

const deleteOption = async (req, res, next) => {
  const { user } = req;
  const { optionId } = req.params;
  const d = await sequelize.transaction();
  try {
    if(!user.roleIds.includes(3))
      throw new APIError("Você não possui permissão para acessar este local.");

    const foundPermission = await User_Permission.findOne({
      where: {
        UserId: user.id,
        PermissionId: 1
      }, attributes: ['id']
    })
    if(!foundPermission)
      throw new APIError("Você não possui a permissão especifica para acessar este local.");

    const foundOption = await Question_Database_Option.findByPk(optionId);
    if(!foundOption)
      throw new APIError("Houve um erro ao encontrar opção.");

    const deletedOption = await foundOption.destroy({}, {transaction: d})
    if(!deletedOption)
      throw new APIError("Houve um erro ao remover opção.");

      await d.commit();
      return res.json({
        success: true,
        message: "Opção removida com sucesso!"
      })
    } catch (err) {
      await d.rollback();
      return res.status(err.status ? err.status : 500).json({
        success: false,
        message: err.message
      })
    }
};

const copyQuestion = async (req, res, next) => {
  const { user } = req;
  const { activityId, databaseQuestionId } = req.params;
  const { score } = req.body;

  const t = await sequelize.transaction();
  try {
    if(!user.ProfessorId) 
      throw new APIError("Usuário não é professor.");

    const foundClassroom = await Classroom.schema(user.schemaname).findOne({
      include: [
        {model: Activity.schema(user.schemaname), where: {id: activityId}, attributes: ['id']}
      ],
      attributes: ['id', 'ProfessorId']
    });
    if(!foundClassroom) 
      throw new APIError("Atividade não encontrada.");
    if(foundClassroom.ProfessorId !== user.ProfessorId)
      throw new APIError("Sala de aula não pertence ao professor.");

    const foundQuestion = await Question_Database.findOne({
      where: {id: databaseQuestionId, active: true},
      include: [
        {model: Question_Database_Option, attributes: ['id','option', 'correct']}
      ], attributes: ['id', 'question', 'FileId']
    })
    if(!foundQuestion) 
      throw new APIError("Questão do banco não encontrada.");

    const createdQuestion = await Activity_Question.schema(user.schemaname).create({
      ActivityId: activityId,
      type: "escolha",
      FileId: foundQuestion.FileId,
      question: foundQuestion.question,
      score
    }, {transaction: t})
    if(!createdQuestion)
      throw new APIError("Houve um erro ao criar questão.");

    let promises = []
    foundQuestion.Question_Database_Options.forEach((element)=>{
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
      throw new APIError("Houve um erro ao criar opção da questão.");
    })
    
    await t.commit();
    return res.json({
      success: true,
      data: createdQuestion,
      message: "Questão criada com sucesso!"
    })
  } catch (err) {
    await t.rollback();
    return res.status(err.status ? err.status : 500).json({
      success: false,
      message: err.message
    })
  }
};

const getRandomQuestionDb = async (req, res, next) => {
  const { type, LevelId, AreaId, GradeId, SubjectId, CourseId } = req.query;
  const { user } = req;

  try {
    if (!user.roleIds.includes(5)) {
      throw new APIError("Apenas alunos podem acessar este local.", httpStatus.UNAUTHORIZED);
    }

    let where = {}
    let whereFlag = {}

    if (!type) {
      throw new APIError("O campo \"type\" é obrigatório.", httpStatus.NOT_ACCEPTABLE);
    }

    if (type === 'classroom') {
      if (!!LevelId)
        where = {...where, LevelId}
      if (!!AreaId)
        where = {...where, AreaId}
      if (!!GradeId)
        where = {...where, GradeId}
      if (!!SubjectId)
        where = {...where, SubjectId}
      if (!!CourseId)
        where = {...where, CourseId}
    }

    if (type === 'classroom')
      whereFlag = {...whereFlag, FlagId: 3}
    if (type === 'enem')
      whereFlag = {...whereFlag, FlagId: 1}

    const questionsFound = await Question_Database.findAndCountAll({
      where,
      include: [
        {
          model: Question_Database_Flag,
          where: whereFlag,
          attributes: ['FlagId']
        },
        {
          model: Question_Database_Tag,
          include: [
            {
              model: Tag,
              attributes: ['title']
            }
          ],
          attributes: {
            exclude: ['createdAt', 'updatedAt']
          }
        },
        {
          model: Question_Database_Option,
          attributes: ['id', 'option']
        }
      ],
      attributes: ['id', 'question', 'FileId']
    })

    let randomInt = getRandomInt(questionsFound.rows.length)
    const selectedQuestion = questionsFound.rows[randomInt]
    
    return res.json({
      data: selectedQuestion || {},
      success: true,
      message: ""
    })
  } catch (err) {
    return res.status(err.status || 500).json({
      success: false,
      message: err.message,
      status: err.status || 500
    })
  }
}

const postRandomQuestionDb = async (req, res, next) => {
  const { OptionId, type, ClassroomId = null } = req.body
  const { questionId } = req.params
  const { user } = req

  try {
    if (!user.roleIds.includes(5)) {
      throw new APIError("Apenas alunos podem acessar este local.", httpStatus.UNAUTHORIZED);
    }

    if (type === 'classroom' && !ClassroomId)
      throw new APIError("ClassroomId é obrigatório")

    const foundQuestion = await Question_Database.findOne({
      where: {
        id: questionId
      },
      include: [
        {
          model: Question_Database_Option,
          attributes: {
            exclude: ['createdAt', 'updatedAt']
          }
        }
      ],
      attributes: {
        exclude: ['createdAt', 'updatedAt']
      }
    })

    if (!foundQuestion) {
      throw new APIError("Esta questão não existe.", httpStatus.NOT_FOUND)
    }
    
    const foundOption = foundQuestion.Question_Database_Options.find(option => option.id == OptionId)

    if (type === 'classroom') {        
      const classroomStudent = await Classroom_Student.schema(user.schemaname).findOne({
        where: {
          StudentId: user.StudentId,
          ClassroomId: ClassroomId
        }
      })
  
      const updatedClassroomStudent = await classroomStudent.update({
        [foundOption.correct ? 'performance' : 'performance_negative']: parseInt(classroomStudent[foundOption.correct ? 'performance' : 'performance_negative']) + 1
      })
    }

    return res.json({
      data: {
        option: foundOption || {},
        justification: foundQuestion.justification || ""
      },      
      success: true,
      message: ""
    })
  } catch (err) {
    return res.status(err.status || 500).json({
      success: false,
      message: err.message,
      status: err.status || 500
    })
  }
}

const getRandomInt = (max) => {
  return Math.floor(Math.random() * max);
}

export default {
  list,
  filteredList,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  createOption,
  deleteOption,
  copyQuestion,
  getRandomQuestionDb,
  postRandomQuestionDb
};