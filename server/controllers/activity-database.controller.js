import db from '../models';
import APIError from '../helpers/APIError';

const { Activity_Database, Activity_Question_Database, Activity_Option_Database, Classroom, Activity, Activity_Question, Activity_Option, File, sequelize } = db;

const list = async (req, res, next) => {
  const { user } = req;
  const { limit = 20, page = 1 } = req.query;
  const offset = 0 + (parseInt(page) - 1) * limit;
  try {
    if(!user.roleIds.includes(4))
      throw new APIError("Usuário não é professor.");
    
    const foundActivities = await Activity_Database.findAndCountAll({
      where: { UserId: user.id },
      attributes: {
        include: [
          [
            sequelize.literal(`(SELECT COUNT(id) FROM "Activity_Question_Databases" AS "questions" WHERE "questions"."ActivityDatabaseId" = "Activity_Database".id)`),
            'questionCount'
          ],
        ], exclude: ['updatedAt', 'ProfessorId']
      },
      order: [['updatedAt', 'DESC']],
      limit,
      offset
    })
    if(!foundActivities)
      throw new APIError("Houve um erro ao listar atividades do banco.");

    return res.json({
      success: true,
      data: foundActivities.rows,
      pagination: {
        limit,
        offset,
        page: parseInt(page),
        count: foundActivities.count,
        nextPage: offset + limit <= foundActivities.count
      }
    })
  } catch (err) {
    return res.status(err.status ? err.status : 500).json({
      success: false,
      message: err.message
    })
  }
}

const createActivity = async (req, res, next) => {
  const { user } = req;
  const { type, title, timer, total_score=0, description } = req.body;
  const t = await sequelize.transaction();

  try {
    if(!user.roleIds.includes(4))
      throw new APIError("Usuário não é professor.");

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

    const createdActivity = await Activity_Database.create({
      UserId: user.id,
      type,
      title, 
      timer: editTimer,
      total_score: editScore,
      description
    }, {transaction: t})

    if(!createdActivity)
      throw new APIError("Houve um erro ao criar nova atividade no banco.");

    await t.commit();
    return res.json({
      success: true,
      data: createdActivity,
    })
  } catch (err) {
    await t.rollback();
    return res.status(err.status ? err.status : 500).json({
      success: false,
      message: err.message
    })
  }
}

const editActivity = async (req, res, next) => {
  const { user } = req;
  const { activityId } = req.params;
  const { title, timer, total_score, description } = req.body;
  const u = await sequelize.transaction();
  try {
    if(!user.roleIds.includes(4))
      throw new APIError("Usuário não é professor.");

    const foundActivity = await Activity_Database.findOne({
      where: {id: activityId},
      attributes: ['id', 'UserId', 'type']
    });
    if(!foundActivity)
      throw new APIError("Atividade não encontrada no banco.");
    if(foundActivity.UserId !== user.id)
      throw new APIError("Você não possui permissão para editar esta atividade.");

    let update = {}
    if(!!title) update = {...update, title}

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
        } else {
          throw new APIError("Teste precisa de tempo de duração.");
        }
        if(total_score === 0)
          throw new APIError("Teste precisa valer nota.");
        update = {...update, total_score}
        break;
      default: 
        throw new APIError("Tipo de atividade invalido.");
    }

    if (!!description) {
      update = {...update, description}
    }

    const updatedActivity = await foundActivity.update(update, {transaction: u});
    if(!updatedActivity)
      throw new APIError("Houve um erro ao atualizar atividade no banco.");

    await u.commit();
    return res.json({
      success: true,
      message: "Atividade do banco atualizada com sucesso!",
      data: updatedActivity,
    })
  } catch (err) {
    await u.rollback();
    return res.status(err.status ? err.status : 500).json({
      success: false,
      message: err.message
    })
  }
}

const deleteActivity = async (req, res, next) => {
  const { user } = req;
  const { activityId } = req.params;
  const d = await sequelize.transaction();
  try {
    if(!user.roleIds.includes(4))
      throw new APIError("Usuário não é professor.");

    const foundActivity = await Activity_Database.findOne({
      where: {id: activityId},
      attributes: ['id', 'UserId']
    });
    if(!foundActivity)
      throw new APIError("Atividade não encontrada no banco.");
    if(foundActivity.UserId !== user.id)
      throw new APIError("Você não possui permissão para remover esta atividade.");
    
    const deletedActivity = await foundActivity.destroy({}, {transaction: d});
    if(!deletedActivity)
      throw new APIError("Houve um erro ao remover atividade do banco.");
    
    await d.commit();
    return res.json({
      success: true,
      message: "Atividade do banco removida com sucesso!"
    })
  } catch (err) {
    await d.rollback();
    return res.status(err.status ? err.status : 500).json({
      success: false,
      message: err.message
    })
  }
}

const getActivity = async (req, res, next) => {
  const { user } = req;
  const { activityId } = req.params;
  try {
    if(!user.roleIds.includes(4))
      throw new APIError("Usuário não é professor.");

    const foundActivity = await Activity_Database.findOne({
      where: { id: activityId },
      include: [
        {
          model: Activity_Question_Database, include: [
            {model: Activity_Option_Database, attributes: ['id', 'correct', 'option']},
            {model: File, attributes: ['id', 'name', 'url_storage']}
          ], attributes: ['id', 'type', 'FileId', 'question', 'score']
        }
      ],
      attributes: ['id', 'type', 'title', 'timer', 'total_score', 'UserId', 'description']
    });
    if(!foundActivity)
      throw new APIError("Atividade não encontrada no banco.");
    if(foundActivity.UserId !== user.id)
      throw new APIError("Você não possui permissão para visualizar esta atividade.");

    return res.json({
      success: true,
      data: foundActivity,
    })
  } catch (err) {
    return res.status(err.status ? err.status : 500).json({
      success: false,
      message: err.message
    })
  }
}

const createActivityQuestion = async (req, res, next) => {
  const { user } = req;
  const { activityId } = req.params;
  const { type, question='', FileId, score=0, options=[] } = req.body;
  const t = await sequelize.transaction();
  try {
    if(!user.roleIds.includes(4))
      throw new APIError("Usuário não é professor.");
    
    const foundActivity = await Activity_Database.findOne({
      where: {id: activityId},
      attributes: ['id', 'type', 'UserId']
    });
    if(!foundActivity)
      throw new APIError("Atividade não encontrada no banco.");
    if(foundActivity.UserId !== user.id)
      throw new APIError("Você não possui permissão para criar questão nesta atividade.");

    if(question === '' && !FileId) throw new APIError("Campo \"question\" ou campo \"FileId\" precisam ser enviados.");

    let editScore = score;
    if(type === "escolha") {
      if(foundActivity.type === "trabalho") 
        throw new APIError("Questões de multipla escolha não podem ser criadas em trabalhos.");
      else if(foundActivity.type === "exercicio") {
        editScore = 0;
      } else {
        if(editScore === 0)
          throw new APIError("Questão de teste precisa valer nota.");
      }
    } else {
      if(foundActivity.type !== "trabalho") 
        throw new APIError("Questões de envio ou escrita não podem ser criadas em testes ou exercícios.");
      if(editScore === 0)
        throw new APIError("Questão de trabalho precisa valer nota.");
    }

    if(!!FileId) {
      const foundFile = await File.findByPk(FileId)
      if(!foundFile)
        throw new APIError("Arquivo não encontrado.");
    }

    const createdQuestion = await Activity_Question_Database.create({
      ActivityDatabaseId: activityId,
      type,
      question,
      FileId,
      score
    }, {transaction: t})
    if(!createdQuestion)
      throw new APIError("Houve um erro ao criar nova questão na atividade do banco.");

    if(type === "escolha" && options.length > 0) {
      let promises = []
      options.forEach((element) => {
        promises.push(
          Activity_Option_Database.create({
            ActivityQuestionDatabaseId: createdQuestion.id,
            option: element.option,
            correct: element.correct
          })
        )
      })
      Promise.all(promises).then(() => {
      }).catch(() => {
        throw new APIError("Houve um erro ao criar resposta da pergunta.");
      })
    }

    await t.commit();
    return res.json({
      success: true,
      data: createdQuestion,
    })
  } catch (err) {
    await t.rollback();
    return res.status(err.status ? err.status : 500).json({
      success: false,
      message: err.message
    })
  }
}

const editActivityQuestion = async (req, res, next) => {
  const { user } = req;
  const { questionId } = req.params;
  const { question, FileId, score, options = [] } = req.body;
  const u = await sequelize.transaction();
  try {
    if(!user.roleIds.includes(4))
      throw new APIError("Usuário não é professor.");

    const foundQuestion = await Activity_Question_Database.findOne({
      where: {id: questionId}, attributes: ['id', 'ActivityDatabaseId']
    })
    if(!foundQuestion)
      throw new APIError("Questão não encontrada no banco.");

    const foundActivity = await Activity_Database.findOne({
      where: {id: foundQuestion.ActivityDatabaseId},
      attributes: ['id','type', 'UserId']
    });
    if(!foundActivity)
      throw new APIError("Atividade não encontrada no banco.");
    if(foundActivity.UserId !== user.id)
      throw new APIError("Você não possui permissão para criar questão nesta atividade.");

    let update = {}
    if(!!question) update = {...update, question}
    if(foundActivity.type !== "exercicio") {
      if(!!score) update = {...update, score}
    }
    if(!!FileId) {
      const foundFile = await File.findByPk(FileId)
      if(!foundFile)
        throw new APIError("Arquivo não encontrado.");
      update = {...update, FileId}
    } 

    const updatedQuestion = await foundQuestion.update(update, {transaction: u});
    if(!updatedQuestion)
      throw new APIError("Houve um erro ao atualizar questão.");

    if(options.length > 0) {
      let promises = []
      options.forEach(async (element) => {
        if (element.id) {
          const option = await Activity_Option_Database.findOne({ where: { id: element.id }})
          promises.push(
            option.update({
              option: element.option,
              correct: element.correct
            })
          )
        } else {
          promises.push(
            Activity_Option_Database.create({
              ActivityQuestionDatabaseId: createdQuestion.id,
              option: element.option,
              correct: element.correct
            })
          )
        }
      })
      Promise.all(promises).then(() => {
      }).catch(() => {
        throw new APIError("Houve um erro ao criar resposta da pergunta.");
      })
    }

    await u.commit();
    return res.json({
      success: true,
      message: "Questão atualizada com sucesso!",
      data: updatedQuestion,
    })
  } catch (err) {
    await u.rollback();
    return res.status(err.status ? err.status : 500).json({
      success: false,
      message: err.message
    })
  }
}

const deleteActivityQuestion = async (req, res, next) => {
  const { user } = req;
  const { questionId } = req.params;
  const d = await sequelize.transaction();

  try {
    if(!user.roleIds.includes(4))
      throw new APIError("Usuário não é professor.");

    const foundQuestion = await Activity_Question_Database.findOne({
      where: {id: questionId}, attributes: ['id', 'ActivityDatabaseId']
    })
    if(!foundQuestion)
      throw new APIError("Questão não encontrada no banco.");

    const foundActivity = await Activity_Database.findOne({
      where: {id: foundQuestion.ActivityDatabaseId},
      attributes: ['id', 'UserId']
    });
    if(!foundActivity)
      throw new APIError("Atividade não encontrada no banco.");
    if(foundActivity.UserId !== user.id)
      throw new APIError("Você não possui permissão para remover questão nesta atividade.");

    const deletedQuestion = await foundQuestion.destroy({}, {transaction: d});
    if(!deletedQuestion)
      throw new APIError("Houve um erro ao remover Questão.");

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
}

const createActivityOption = async (req, res, next) => {
  const { user } = req;
  const { questionId } = req.params;
  const { option, correct=false } = req.body;
  const t = await sequelize.transaction();
  try {
    if(!user.roleIds.includes(4))
      throw new APIError("Usuário não é professor.");

    const foundActivity = await Activity_Database.findOne({
      include: [
        {
          model: Activity_Question_Database,
          where: {id: questionId},
          attributes: ['id', 'type']
        }
      ],
      attributes: ['id', 'UserId']
    });
    if(!foundActivity)
      throw new APIError("Atividade não encontrada no banco.");
    if(foundActivity.UserId !== user.id)
      throw new APIError("Você não possui permissão para criar opção nesta questão.");
    if(foundActivity.Activity_Question_Databases[0].type !== "escolha")
      throw new APIError("Opções não podem ser adicionadas a este tipo de questão.");

    const createdOption = await Activity_Option_Database.create({
      ActivityQuestionDatabaseId: questionId,
      correct,
      option
    }, {transaction: t})
    if(!createdOption)
      throw new APIError("Houve um erro ao criar nova opção.");

    await t.commit();
    return res.json({
      success: true,
      data: createdOption,
    })
  } catch (err) {
    await t.rollback();
    return res.status(err.status ? err.status : 500).json({
      success: false,
      message: err.message
    })
  }
}

const deleteActivityOption = async (req, res, next) => {
  const { user } = req;
  const { optionId } = req.params;
  const d = await sequelize.transaction();
  try {
    if(!user.roleIds.includes(4))
      throw new APIError("Usuário não é professor.");

    const foundOption = await Activity_Option_Database.findOne({
      where: {id: optionId}, attributes: ['id', 'ActivityQuestionDatabaseId']
    })
    if(!foundOption)
      throw new APIError("Opção não encontrada.");
    
    const foundActivity = await Activity_Database.findOne({
      include: [
        {
          model: Activity_Question_Database,
          where: {id: foundOption.ActivityQuestionDatabaseId},
          attributes: ['id']
        }
      ],
      attributes: ['id', 'UserId']
    });
    if(!foundActivity)
      throw new APIError("Atividade não encontrada no banco.");
    if(foundActivity.UserId !== user.id)
      throw new APIError("Você não possui permissão para criar opção nesta questão.");

    const deletedOption = await foundOption.destroy({}, {transaction: d})
    if(!deletedOption)
      throw new APIError("Houve um erro ao remover Opção.");

    await d.commit();
    return res.json({
      message: "Opção removida com sucesso!",
      success: true,
    })
  } catch (err) {
    await d.rollback();
    return res.status(err.status ? err.status : 500).json({
      success: false,
      message: err.message
    })
  }
}

const copyFromActivityToDatabase = async (req, res, next) => {
  const { user } = req;
  const { classroomActivityId } = req.params;
  const { title } = req.body
  const t = await sequelize.transaction();
  try {
    if(!user.ProfessorId)
      throw new APIError("Usuário não é professor.");

    const foundClassroom = await Classroom.schema(user.schemaname).findOne({
      include: [
        {model: Activity.schema(user.schemaname), where: {id: classroomActivityId}, attributes: ['id']}
      ], attributes: ['id', 'ProfessorId']
    })
    if(!foundClassroom)
      throw new APIError("Atividade não encontrada.");
    if(foundClassroom.ProfessorId !== user.ProfessorId)
      throw new APIError("Você não possui permissão de acessar esta atividade.");

    const foundActivity = await Activity.schema(user.schemaname).findAll({
      where: { id: classroomActivityId },
      include: [
        {model: Activity_Question.schema(user.schemaname), include: [
          {model: Activity_Option.schema(user.schemaname), attributes: ['id', 'option', 'correct']}
        ], attributes: ['id', 'type', 'question', 'FileId', 'score']}
      ], attributes: ['id', 'type', 'timer', 'total_score']
    })
    if(!foundActivity)
      throw new APIError("Houve um erro ao listar questões da atividade.");

    const createdActivity = await Activity_Database.create({
      UserId: user.id,
      type: foundActivity[0].type,
      title,
      timer: foundActivity[0].timer,
      total_score: foundActivity[0].total_score
    }, {transaction: t})
    if(!createdActivity)
      throw new APIError("Houve um erro ao criar atividade.");

    await t.commit();

    if(foundActivity[0].Activity_Questions.length > 0) {
      let promises = []
      let nestedPromises = []
      foundActivity[0].Activity_Questions.forEach((question) => {
        promises.push(
          Activity_Question_Database.create({
            ActivityDatabaseId: createdActivity.id,
            type: question.type,
            FileId: question.FileId,
            question: question.question,
            score: question.score
          }).then((created)=>{
            if(question.Activity_Options.length > 0) {
              nestedPromises.push(
                question.Activity_Options.forEach((option) => {
                  Activity_Option_Database.create({
                    ActivityQuestionDatabaseId: created.id,
                    option: option.option,
                    correct: option.correct
                  })
                })
              )
            }
          })
        )
      })
      await Promise.all(promises)
      await Promise.all(nestedPromises)
    }

    return res.json({
      success: true,
      data: createdActivity,
    })
  } catch (err) {
    await t.rollback();
    return res.status(err.status ? err.status : 500).json({
      success: false,
      message: err.message
    })
  }
}

const copyFromDatabaseToActivity = async (req, res, next) => {
  const { user } = req;
  const { databaseActivityId, classroomId } = req.params;
  const { title, description, deadline, active=false } = req.body;
  const t = await sequelize.transaction();
  try {
    if(!user.ProfessorId)
      throw new APIError("Usuário não é professor.");

    const foundClassroom = await Classroom.schema(user.schemaname).findOne({
      where: {id: classroomId}, attributes: ['id', 'ProfessorId']
    })
    if(!foundClassroom)
      throw new APIError("Sala de aula não encontrada.");
    if(foundClassroom.ProfessorId !== user.ProfessorId)
      throw new APIError("Você não possui permissão de criar atividade nesta sala de aula.");
    
    const foundDatabaseActivity = await Activity_Database.findAll({
      where: { id: databaseActivityId },
      include: [
        {
          model: Activity_Question_Database, include: [
            {
              model: Activity_Option_Database,
              attributes: {
                exclude: ['ActivityQuestionDatabaseId', 'createdAt', 'updatedAt']
              }
            }
          ], attributes: {
            exclude: ['ActivityDatabaseId', 'createdAt', 'updatedAt']
          }
        }
      ], attributes: {
        exclude: ['createdAt', 'updatedAt']
      }
    })
    if(!foundDatabaseActivity)
      throw new APIError("Houve um erro ao listar questões da atividade.");
    if(foundDatabaseActivity.length === 0)
      throw new APIError("Atividade do banco não encontrada.");
    if(foundDatabaseActivity[0].UserId !== user.id)
      throw new APIError("Você não possui permissão de acessar esta atividade.");

    const createdActivity = await Activity.schema(user.schemaname).create({
      ClassroomId: classroomId,
      active,
      type: foundDatabaseActivity[0].type,
      title,
      deadline,
      description,
      timer: foundDatabaseActivity[0].timer,
      total_score: foundDatabaseActivity[0].total_score
    }, {transaction: t})
    if(!createdActivity)
      throw new APIError("Houve um erro ao criar atividade.");

    await t.commit();

    if(foundDatabaseActivity[0].Activity_Question_Databases.length > 0) {
      let promises = []
      let nestedPromises = []
      foundDatabaseActivity[0].Activity_Question_Databases.forEach((question) => {
        promises.push(
          Activity_Question.schema(user.schemaname).create({
            ActivityId: createdActivity.id,
            type: question.type,
            FileId: question.FileId,
            question: question.question,
            score: question.score
          }).then((created)=>{
            if(question.Activity_Option_Databases.length > 0) {
              nestedPromises.push(
                question.Activity_Option_Databases.forEach((option) => {
                  Activity_Option.schema(user.schemaname).create({
                    ActivityQuestionId: created.id,
                    option: option.option,
                    correct: option.correct
                  })
                })
              )
            }
          })
        )
      })
      await Promise.all(promises)
      await Promise.all(nestedPromises)
    }

    return res.json({
      success: true,
      data: createdActivity,
    })
  } catch (err) {
    await t.rollback();
    return res.status(err.status ? err.status : 500).json({
      success: false,
      message: err.message
    })
  }
}

export default {
  list, createActivity, editActivity, deleteActivity, getActivity, createActivityQuestion, editActivityQuestion, deleteActivityQuestion, createActivityOption, deleteActivityOption, copyFromActivityToDatabase, copyFromDatabaseToActivity
};