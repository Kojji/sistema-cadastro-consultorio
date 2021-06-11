import APIError from '../helpers/APIError';
import crypto from "crypto-js";
import EmailProvider from "../services/emails/email.provider";
import replaceSpecialChars from "../helpers/textNormalize";
import db from '../models';
import { Op } from 'sequelize';
import user_area from '../models/user_area';

const { User, Area, User_Area, User_Role_Institution, Institution, Student, Classroom, Classroom_Code, Classroom_Student, Professor, Level, Subject, Course, Grade, sequelize } = db;

const load = async (req, res, next, id) => {
  try {
    const user = await User.findOne({ where: { id } })

    if (!user) {
      throw new APIError("Este usuário não existe.");
    }

    req.user = user; // eslint-disable-line no-param-reassign

    return next();
  } catch (err) {
    return res.status(err.status ? err.status : 500).json({
      success: false,
      message: err.message,
      status: err.status ? err.status : 500
    })
  }
}

const firstSubmit = async (req, res, next) => {
  const { name, email, phone, username, role } = req.body;

  const t = await sequelize.transaction();
  const u = await sequelize.transaction();
  try {
    const phoneRegex = /(0?[1-9]{2})*\D*(9?)\D?(\d{4})+\D?(\d{4})\b/g;
    if (!phoneRegex.test(phone)) {
      throw new APIError("Telefone informado é inválido.");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(email)) {
      throw new APIError("Endereço de E-mail inválido.");
    }

    const checkEmail = await User.findAndCountAll({
      where: {
        [Op.or]: {
          email,
          username: replaceSpecialChars(username)
        }
      }
    });

    if (checkEmail.count > 0) {
      throw new APIError("E-mail ou nome de usuário já cadastrados na plataforma.");
    }

    const key = crypto.MD5(email + new Date());

    const newUser = await User.create({
      name,
      email,
      phone,
      username: replaceSpecialChars(username),
      active: false,
      confirmed: false,
      photo: null,
      password: null,
      key: key.toString(),
      tour: false,
      connected: false,
      ip_connected: ''
    }, { transaction: t })

    if (!newUser) {
      throw new APIError("Houve um erro na criação do usuário.")
    }

    const newUserRoleInstitution = await User_Role_Institution.create({
      UserId: newUser.id,
      RoleId: role === "professor" ? 4 : 5,
      InstitutionId: null
    }, { transaction: t });

    if (!newUserRoleInstitution) {
      throw new APIError("Houve um erro na criação das permissões do usuário.")
    }

    if (!(await EmailProvider.sendUserConfirmation(newUser))) {
      throw new APIError("Houve um erro ao processar o envio de e-mail.");
    }

    await t.commit();
    await u.commit();

    return res.json({
      success: true,
      message: 'Usuário criado com sucesso!'
    })
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

const userConfirmation = async (req, res, next) => {
  const { key } = req.query;

  try {
    const foundUser = await User.findOne({
      where: { key },
      attributes: ['id', 'name', 'email', 'username'],
      include: [
        {model: User_Role_Institution, attributes: ["RoleId"]}
      ]
    });

    if (!foundUser) {
      throw new APIError("Link inválido ou expirado.");
    }

    const areas = await Area.findAll({
      attributes: ['id', 'title']
    })

    return res.json({
      success: true,
      message: 'Usuário encontrado!',
      user: foundUser,
      areas
    })

  } catch (err) {
    return res.status(err.status ? err.status : 500).json({
      message: err.message,
      success: false,
      status: err.status ? err.status : 500
    });
  }
}

const postUserConfirmation = async (req, res, next) => {
  const { profession, Areas, dtbirth, cpf, rg, password, confirm_password } = req.body;
  const { user } = req;

  const t = await sequelize.transaction();
  try {
    if (!user.key && user.confirmed) {
      throw new APIError("Usuário já confirmado.");
    }

    if (password !== confirm_password) {
      throw new APIError("As senhas não coincidem.");
    }

    const regexCPF = /^\d{3}\.\d{3}\.\d{3}\-\d{2}$/;

    if (!regexCPF.test(cpf)) {
      throw new APIError("Número de CPF inválido.");
    }

    const passwordHashed = await User.passwordHash(password);

    const foundRole = await User_Role_Institution.findOne({
      where: {UserId: user.id},
      attributes: ['RoleId']
    })
    if(!foundRole)
      throw new APIError("Houve um erro ao determinar o tipo de conta a ser criada.");

    const updateUser = await user.update({
      profession: foundRole.RoleId === 4? profession : null,
      dtbirth,
      cpf,
      rg,
      password: passwordHashed,
      active: true,
      confirmed: true,
      key: null
    }, { transaction: t });

    if (!updateUser) {
      throw new APIError("Houve um erro na atualização do usuário.");
    }

    if(foundRole.RoleId === 4) {
      let promises = []
      Areas.forEach(area => {
        promises.push(
          User_Area.create({
            AreaId: area,
            UserId: user.id
          })
        )
      })

      Promise.all(promises)
    }

    await t.commit();

    return res.json({
      success: true,
      message: 'Usuário atualizado com sucesso!'
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

const getStudentEnrollment = async (req, res, next) => {
  const { institutionId, classCode } = req.params;

  try {
    const institution = await Institution.findByPk(institutionId);

    if (!institution) {
      throw new APIError("Esta instituição de ensino não existe.");
    }

    const classroom = await Classroom.schema(institution.schemaname).findOne({
      attributes: ['id', 'SubjectId', 'LevelId', 'CourseId', 'courseName', 'ProfessorId'],
      include: [
        {
          model: Classroom_Code.schema(institution.schemaname),
          where: { class_code: classCode }
        },
        {
          model: Professor.schema(institution.schemaname),
          attributes: ['id'],
          include: [
            {
              model: User,
              attributes: ['name', 'photo']
            }
          ]
        },
        {
          model: Level,
          attributes: ['title']
        },
        {
          model: Subject,
          attributes: ['title'],
          include: [
            {
              model: Grade,
              attributes: ['title']
            }
          ]
        },
        {
          model: Course,
          attributes: ['title']
        }
      ]
    })

    if (!classroom) {
      throw new APIError("Código inválido ou expirado.");
    }

    return res.json({
      success: true,
      message: "",
      data: {
        Institution: {
          id: institution.id,
          name: institution.name,
          photo: institution.photo
        },
        Classroom: classroom
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

const studentEnrollment = async (req, res, next) => {
  const { institutionId, classCode } = req.params;
  const { username, password, confirm_password, email, phone, name, dtbirth, cpf, type = 'cadastro' } = req.body;

  try {
    const institution = await Institution.findByPk(institutionId);

    if (!institution) {
      throw new APIError("Esta instituição de ensino não existe.");
    }

    const classroom = await Classroom.schema(institution.schemaname).findOne({
      include: [{
        model: Classroom_Code.schema(institution.schemaname),
        where: { class_code: classCode }
      }]
    })

    if (!classroom) {
      throw new APIError("Código inválido ou expirado.");
    }

    if (type === 'login') {
      const getUser = await User.findOne({
        where: {
          [Op.or]: {
            username,
            email: username
          }
        },
        attributes: ['id', 'password']
      })

      if (!getUser) {
        throw new APIError("Este usuário não existe.");
      }

      if (!(await User.passwordMatches(password, getUser.password))) {
        throw new APIError("Os campos e-mail/usuário e/ou senha estão inválidos.");
      }

      const getStudent = await Student.schema(institution.schemaname).findOne({ where: { UserId: getUser.id } })

      if (!!getStudent) {
        const getClassroomStudent = await Classroom_Student.schema(institution.schemaname).findOne({ where: { StudentId: getStudent.id, ClassroomId: classroom.id }, attributes: ['StudentId'] })
        if (!!getClassroomStudent) {
          return res.json({
            success: false,
            message: "Aluno já cadastrado nesta disciplina!"
          })
        }

        const createClassroomStudent = await Classroom_Student.schema(institution.schemaname).create({
          active: true,
          ClassroomId: classroom.id,
          StudentId: getStudent.id,
          absences: 0,
          attendance: 0,
          status: '0',
          points: 0.0,
          performance: 0,
          performance_negative: 0
        })

        if (!createClassroomStudent) {
          throw new APIError("Houve um erro desconhecido ao adicionar o aluno na sala de aula.");
        }

        return res.json({
          success: true,
          message: "Aluno cadastrado com sucesso na disciplina!"
        })
      }

      const createStudent = await Student.schema(institution.schemaname).create({
        UserId: getUser.id,
        GradeId: null,
        LevelId: classroom.LevelId,
        active: true
      })

      if (!createStudent) {
        throw new APIError("Não foi possível cadastrar o aluno na instituição de ensino.");
      }

      const createClassroomStudent = await Classroom_Student.schema(institution.schemaname).create({
        active: true,
        ClassroomId: classroom.id,
        StudentId: createStudent.id,
        absences: 0,
        attendance: 0,
        status: '0',
        points: 0.0,
        performance: 0,
        performance_negative: 0
      })

      if (!createClassroomStudent) {
        throw new APIError("Houve um erro desconhecido ao adicionar o aluno na sala de aula.");
      }

      const getUserRoleInstitution = await User_Role_Institution.findOne({
        where: {
          UserId: getUser.id,
          RoleId: 5,
          InstitutionId: institutionId
        }
      });
      if(!getUserRoleInstitution) {
        const createdRelation = await User_Role_Institution.create({
          UserId: getUser.id,
          RoleId: 5,
          InstitutionId: institutionId
        });
        
        if (!createdRelation) {
          throw new APIError("Houve um erro na criação das permissões do usuário.")
        }

        await getUser.update({
          InstitutionId: institutionId,
        })
      }

      return res.json({
        success: true,
        message: "Aluno cadastrado com sucesso na disciplina!"
      })
    }

    if (type === 'cadastro') {
      const phoneRegex = /(0?[1-9]{2})*\D*(9?)\D?(\d{4})+\D?(\d{4})\b/g;
      if (!phoneRegex.test(phone)) {
        throw new APIError("Telefone informado é inválido.");
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
      if (!emailRegex.test(email)) {
        throw new APIError("Endereço de E-mail inválido.");
      }

      const checkEmail = await User.findAndCountAll({
        where: {
          [Op.or]: {
            email,
            username: replaceSpecialChars(username)
          }
        }
      });

      if (checkEmail.count > 0) {
        throw new APIError("E-mail ou nome de usuário já cadastrados na plataforma.");
      }

      if (password !== confirm_password) {
        throw new APIError("As senhas não coincidem.");
      }

      const key = crypto.MD5(email + new Date());

      const regexCPF = /^\d{3}\.\d{3}\.\d{3}\-\d{2}$/;
      if (!regexCPF.test(cpf)) {
        throw new APIError("Número de CPF inválido.");
      }

      const passwordHashed = await User.passwordHash(password);

      const createUser = await User.create({
        name,
        email,
        phone,
        username: replaceSpecialChars(username),
        active: true,
        confirmed: false,
        photo: null,
        password: passwordHashed,
        key: key.toString(),
        tour: false,
        connected: false,
        ip_connected: '',
        dtbirth,
        cpf,
        InstitutionId: institution.id
      })

      if (!createUser) {
        throw new APIError("Houve um erro na criação do usuário.")
      }

      const createUserRoleInstitution = await User_Role_Institution.create({
        UserId: createUser.id,
        RoleId: 5,
        InstitutionId: institution.id
      });

      if (!createUserRoleInstitution) {
        throw new APIError("Houve um erro na criação das permissões do usuário.")
      }

      if (!(await EmailProvider.sendUserActivation(createUser))) {
        throw new APIError("Houve um erro ao processar o envio de e-mail.");
      }

      const createStudent = await Student.schema(institution.schemaname).create({
        UserId: createUser.id,
        GradeId: null,
        LevelId: classroom.LevelId,
        active: true
      })

      if (!createStudent) {
        throw new APIError("Não foi possível cadastrar o aluno na instituição de ensino.");
      }

      const createClassroomStudent = await Classroom_Student.schema(institution.schemaname).create({
        active: true,
        ClassroomId: classroom.id,
        StudentId: createStudent.id,
        absences: 0,
        attendance: 0,
        status: '0',
        points: 0.0,
        performance: 0,
        performance_negative: 0
      })

      if (!createClassroomStudent) {
        throw new APIError("Houve um erro desconhecido ao adicionar o aluno na sala de aula.");
      }

      return res.json({
        success: true,
        message: "Conta criada com sucesso!"
      })
    }

    throw new APIError("Tipo de entrada da disciplina errado.");
  } catch (err) {
    return res.status(err.status ? err.status : 500).json({
      message: err.message,
      success: false,
      status: err.status ? err.status : 500
    });
  }
}

const activateAccount = async (req, res, next) => {
  const { key } = req.params

  const t = await sequelize.transaction();
  try {
    const getUser = await User.findOne({
      where: {
        key
      }
    })

    if (!getUser) {
      throw new APIError("Chave inválida ou expirada.")
    }

    const updatedUser = await getUser.update({
      key: null,
      confirmed: true
    }, { transaction: t })

    if (!updatedUser) {
      throw new APIError("Houve um erro na confirmação do usuário.")
    }

    await t.commit();

    return res.json({
      data: {},
      success: true,
      message: "Usuário confirmado com sucesso!"
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

export default {
  load,
  firstSubmit,
  userConfirmation,
  postUserConfirmation,
  getStudentEnrollment,
  studentEnrollment,
  activateAccount
}