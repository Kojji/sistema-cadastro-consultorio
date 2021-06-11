import httpStatus from 'http-status';
import db from '../models';
import crypto from "crypto-js";
import APIError from '../helpers/APIError';

const { Classroom, Professor, Student, Classroom_Student, Level, Grade, Subject, Course, User, sequelize } = db;

/**
 * Get classroom
 * @returns {Classroom}
 */
const get = async (req, res) => {
  const { user } = req;
  const { classroomStudentId } = req.params;

  try {
    if (!user.roleIds.some(role => role === 1 || role === 4 || role === 5)) {
      throw new APIError("Você não tem permissão para visualizar salas de aula");
    }

    const classroom = await Classroom_Student.schema(user.schemaname).findOne({
      where: {id: classroomStudentId},
      include: [
        {
          model: Student.schema(user.schemaname),
          include: [
            {
              model: User,
              attributes: ['id', 'name', 'phone', 'email', 'photo']
            }
          ]
        },
        {
          model: Classroom.schema(user.schemaname),
          include: [
            {model: Level},
            {model: Subject, include: [{model: Grade}]},
            {model: Course},
          ]
        }
      ]
    })


    if (user.roleIds.includes(4) && !user.roleIds.includes(1) && !user.roleIds.includes(5)) {
      if (!user.ProfessorId) {
        throw new APIError("Este professor não existe.");
      }

      if (classroom.Classroom.ProfessorId !== user.ProfessorId) {
        throw new APIError("Você só pode acessar as suas salas de aula.")
      }
    }

    if (user.roleIds.includes(5) && !user.roleIds.includes(1) && !user.roleIds.includes(4)) {
      if (!user.StudentId) {
        throw new APIError("Este aluno não existe.");
      }

      if (classroom.Student.UserId !== user.id) {
        throw new APIError("Você só pode acessar as suas salas de aula.")
      }
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
 * Update existing classroom
 * @returns {Classroom}
 */
const update = async (req, res, next) => {
    const { active, absences, attendance, status } = req.body;
    const { classroomStudentId } = req.params;
    const { user } = req;

    const u = await sequelize.transaction();
    try {
        if (!user.ProfessorId) {
          throw new APIError("Você não tem permissão para acessar este local.");
        }

        const classroom = await Classroom_Student.schema(user.schemaname).findOne({
          where: {
            id: classroomStudentId
          },
          include: [
            {
              model: Classroom.schema(user.schemaname),
              attributes: ['id', 'ProfessorId']
            }
          ]
        })

        if (!user.roleIds.includes(4) && user.ProfessorId !== classroom.Classroom.ProfessorId) {
          throw new APIError("Você não possui permissão para atualizar este aluno."); 
        }

        let update = {}

        if (!!active) {
          update = {...update, active}
        }

        if (!!absences) {
          update = {...update, absences: absences === 0 ? classroom.absences : ++classroom.absences}
        }

        if (!!attendance) {
          update = {...update, attendance: attendance === 0 ? classroom.attendance : ++classroom.attendance}
        }

        if (!!status) {
          update = {...update, status}
        }

        const updatedClassroomStudent = await classroom.update(update, {transaction: u});

        if (!updatedClassroomStudent) {
          throw new APIError("Houve um erro ao atualizar o aluno.");
        }

        u.commit();

        return res.json({
          success: true,
          message: "Aluno atualizado com sucesso!"
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
  const { limit = 20, page = 1, active = true, ClassroomId, StudentId } = req.query;
  const { user } = req;
  const offset = 0 + (parseInt(page) - 1) * limit;

  try {
    // Em breve o administrador também poderá visualizar esta rota
    if (!user.roleIds.some(role => role === 4 || role === 5)) {
      throw new APIError("Você não tem permissão para acessar este local.");
    }

    let where = {}

    let include = [
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

    if (!!ClassroomId) {
      where = {...where, ClassroomId}
    }

    if (!!StudentId) {
      const findStudent = await Student.schema(user.schemaname).findOne({
        where: {
          id: StudentId
        },
        attributes: ['id', 'UserId']
      })

      if (user.id !== findStudent.UserId) {
        throw new APIError("Você não tem permissão para obter estes dados.");
      }

      where = {...where, StudentId}
      include.push({
        model: Classroom.schema(user.schemaname),
        where: {
          active
        },
        include: [
          {model: Level},
          {model: Subject, include: [{model: Grade}]},
          {model: Course}
        ]
      })
    }

    // if (!ClassroomId) {
    //   throw new APIError("Parâmetro \"ClassroomId\" é obrigatório.");
    // }

    // if (!StudentId) {
    //   throw new APIError("Parâmetro \"StudentId\" é obrigatório.");
    // }

    // if (!!ProfessorId) {
    //   const getProfessor = await Professor.schema(user.schemaname).findOne({where: {id: ProfessorId}, attributes: ['id', 'UserId']})

    //   if (!getProfessor) {
    //     throw new APIError("Este professor não existe.");
    //   }

    //   if (!user.roleIds.includes(1) && user.roleIds.includes(4) && user.id != getProfessor.UserId) {
    //     throw new APIError("Você só pode acessar as suas disciplinas.");
    //   }
    // }

    const classrooms = await Classroom_Student.schema(user.schemaname).findAndCountAll({
        where,
        include,
        // order: [['name', 'ASC']],
        limit,
        offset
    });

    if (!classrooms) {
        throw new APIError("Não foi possível trazer a lista de cursos");
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
  } catch(err) {
      return res.status(err.status ? err.status : 500).json({
          success: false,
          message: err.message
      })
  }
}


export default {
    get,
    update,
    list
};
