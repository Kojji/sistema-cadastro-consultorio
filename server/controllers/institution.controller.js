import httpStatus from "http-status";
import db from "../models/index";
import APIError from "../helpers/APIError";
import replaceSpecialChars from "../helpers/textNormalize";
import axios from "axios";
import vars from '../../config/vars';
import fs from 'fs-extra';
import { writeFile } from 'fs';
import path from 'path';
import { Op } from "sequelize";

const { User, Institution, User_Role_Institution, Professor, Student, Classroom, sequelize } = db

/**
 * Load user and append to req.
 */
const load = async (req, res, next, id) => {
  try {
    const institution = await Institution.findOne({ where: { id } })

    if (!institution) {
      throw new APIError("Esta instituição não existe.");
    }

    req.institution = institution; // eslint-disable-line no-param-reassign

    return next();
  } catch (err) {
    return res.status(err.status ? err.status : 500).json({
      success: false,
      message: err.message,
      status: err.status ? err.status : 500
    })
  }
}

const create = async (req, res, next) => {
  const { name, cep, city, state, district, address, number, complement, phone, timezone = "America/Sao_Paulo" } = req.body;

  const t = await sequelize.transaction();
  try {
    const institutions = await Institution.findAndCountAll({
      where: {
        name: {
          [Op.iLike]: `%${name}`
        },
        city,
        state,
        [Op.or]: {
          cep,
          district
        }
      }
    })

    if (institutions.count > 0) {
      throw new APIError("Instituição de ensino já existente no sistema na sua região.");
    }

    const schemaName = state.toLowerCase() + '_' + replaceSpecialChars(city) + '_' + Date.now();

    const institution = await Institution.create({
      name,
      cep,
      city,
      state,
      district,
      address,
      number,
      complement,
      phone,
      active: true,
      activity: '',
      tour: false,
      schemaname: schemaName,
      createSchema: false,
      creatingSchema: false,
      timezone,
      photo: null,
    }, { transaction: t });

    if (!institution) {
      throw new APIError("Houve um erro na criação da instituição de ensino.");
    }

    const dbCreate = await createDb(institution);

    if (!dbCreate) {
      throw new APIError("Houve um erro na criação do banco de dados da instituição de ensino.");
    }

    await t.commit();

    return res.json({
      success: true,
      data: institution,
      message: 'Instituição de ensino criada com sucesso!'
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

const list = async (req, res, next) => {
  const { limit = 20, page = 1, search = null } = req.query
  const { user } = req
  const offset = 0 + (parseInt(page) - 1) * limit

  try {
    if (!user.roleIds.includes(1)) {
      throw new APIError("Você não tem permissão.");
    }

    let where = null

    if (!!search) {
      where = {
        [Op.or]: {
          name: {
            [Op.iLike]: `%${search}%`
          },
          state: {
            [Op.iLike]: `%${search}%`
          },
          city: {
            [Op.iLike]: `%${search}%`
          },
          address: {
            [Op.iLike]: `%${search}%`
          },
          district: {
            [Op.iLike]: `%${search}%`
          },
          phone: {
            [Op.iLike]: `%${search}%`
          }
        }
      }
    }

    const institutions = await Institution.findAndCountAll({
      where,
      limit,
      offset,
      raw: true
    })

    for (const institution of institutions.rows) {
      const professors = await Professor.schema(institution.schemaname).findAndCountAll({
        attributes: ['id']
      })

      const students = await Student.schema(institution.schemaname).findAndCountAll({
        attributes: ['id']
      })

      const classrooms = await Classroom.schema(institution.schemaname).findAndCountAll({
        attributes: ['id'],
        where: {
          active: true
        }
      })

      institution.professors_count = professors.count
      institution.students_count = students.count
      institution.classrooms_active_count = classrooms.count
    }

    if (!institutions) {
      throw new APIError("Houve um erro na listagem das instituições de ensino.");
    }

    return res.json({
      success: true,
      data: institutions.rows,
      pagination: {
        limit,
        offset,
        page: parseInt(page),
        count: institutions.count,
        nextPage: offset + limit <= institutions.count
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
 * Update existing institution
 * @returns {Institution}
 */
const update = async (req, res, next) => {
  const { user, body, institution } = req;

  const u = await sequelize.transaction();
  try {
    if (!user.roleIds.some(role => role === 1 || role === 4)) {
      throw new APIError("Você não possui permissão para atualizar a instituição.");
    }

    const updatedUser = await institution.update({
      name: body.name,
      phone: body.phone,
      cep: body.cep,
      district: body.district,
      address: body.address,
      number: body.number,
      complement: body.complement
    }, { transaction: u });

    if (!updatedUser) {
      throw new APIError("Houve um erro ao atualizar a instituição.");
    }

    u.commit();

    return res.json({
      success: true,
      message: "Instituição atualizada com sucesso!"
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

async function listInstitutions(req, res, next) {
  try {
    if (req.user.roleIds.includes(1) || req.user.roleIds.includes(3)) {
      return res.json({
        data: [],
        success: true,
        message: "",
      });
    }

    const user_role_institution = await User_Role_Institution.findAll({
      where: {
        UserId: req.user.id
      },
      attributes: ['InstitutionId'],
      include: [
        {
          model: Institution,
          attributes: ["id", "name", "photo"],
        },
      ],
    })

    if (!user_role_institution) {
      throw new APIError("Não foi possível listar as escolas disponíveis.");
    }

    return res.json({
      data: user_role_institution,
      success: true,
      message: "",
    });
  } catch (err) {
    return res.status(err.status ? err.status : 500).json({
      success: false,
      message: err.message
    })
  }
}

async function changeInstitution(req, res, next) {
  const { InstitutionId, UserId } = req.body;

  try {
    const user = await User.findByPk(UserId);

    const userUpdate = await user.update({
      InstitutionId,
    })

    if (!userUpdate) {
      throw new APIError("Não foi possível trocar a escola.");
    }

    return res.json({ success: true, message: "" });
  } catch (err) {
    return res.status(err.status ? err.status : 500).json({
      success: false,
      message: err.message
    })
  }
}

const searchInstitutions = async (req, res, next) => {
  const { city, state } = req.query;

  try {
    const institutionsFound = await Institution.findAll({
      where: {
        city,
        state
      },
      attributes: ['id', 'name']
    })

    if (!institutionsFound) {
      throw new APIError("Houve um erro desconhecido na procura por escolas.");
    }

    return res.json({ data: institutionsFound, success: true, message: "" });

  } catch (err) {
    return res.status(err.status ? err.status : 500).json({
      success: false,
      message: err.message
    })
  }
}

const getUf = async (req, res, next) => {
  try {
    const ufs = await axios.get('https://servicodados.ibge.gov.br/api/v1/localidades/estados')

    if (!ufs) {
      throw new APIError("Houve um erro na busca dos estados.");
    }

    const estados = ufs.data.map((uf => ({
      id: uf.id,
      sigla: uf.sigla,
      nome: uf.nome
    })))

    return res.json({ data: estados, success: true, message: "" });
  } catch (err) {
    return res.status(err.status ? err.status : 500).json({
      success: false,
      message: err.message
    })
  }
}

const getCity = async (req, res, next) => {
  const { uf } = req.params;

  try {
    const cities = await axios.get('https://servicodados.ibge.gov.br/api/v1/localidades/estados/' + uf + '/municipios')

    if (!cities) {
      throw new APIError("Houve um erro na busca das cidades.");
    }

    const estados = cities.data.map((city => ({
      id: city.id,
      nome: city.nome
    })))

    return res.json({ data: estados, success: true, message: "" });
  } catch (err) {
    return res.status(err.status ? err.status : 500).json({
      success: false,
      message: err.message
    })
  }
}

const getCEP = async (req, res, next) => {
  const { cep } = req.params;

  try {
    if (!cep) {
      throw new APIError("CEP inválido, digite novamente.");
    }

    let c = JSON.parse(JSON.stringify(cep));

    c = c.replace(/\D/g, "");

    // Expressão regular para validar o CEP.
    let validacep = /^[0-9]{8}$/;
    // Valida o formato do CEP.
    if (!validacep.test(c) || c === "") {
      if (c !== "") {
        throw new APIError("CEP Inválido, digite novamente.");
      }
    }

    const getCEP = await axios.get("https://viacep.com.br/ws/" + c + "/json/")

    if (!getCEP) {
      throw new APIError("Serviço de busca de CEP indisponível.");
    }

    if ("erro" in getCEP.data) {
      throw new APIError("CEP não encontrado.");
    }

    return res.json({
      success: true,
      data: getCEP.data,
      message: "CEP encontrado!"
    })
  } catch (err) {
    return res.status(err.status ? err.status : 500).json({
      success: false,
      message: err.message
    })
  }
}

const createDb = async (institution) => {
  return new Promise((resolve, reject) => {
    sequelize.query(
      `
        CREATE SCHEMA IF NOT EXISTS ${institution.schemaname} AUTHORIZATION ${vars.postgres.user};
  
        CREATE TABLE IF NOT EXISTS "${institution.schemaname}"."Professors" ("id"   SERIAL, "UserId" INTEGER REFERENCES "public"."Users" ("id") ON DELETE SET NULL ON UPDATE CASCADE, "active" BOOLEAN NOT NULL, "institution_email" VARCHAR(255) NOT NULL, "institution_phone" VARCHAR(255) NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL, PRIMARY KEY ("id"));
  
        CREATE TABLE IF NOT EXISTS "${institution.schemaname}"."Students" ("id"   SERIAL, "UserId" INTEGER REFERENCES "public"."Users" ("id") ON DELETE SET NULL ON UPDATE CASCADE, "LevelId" INTEGER REFERENCES "public"."Levels" ("id") ON DELETE SET NULL ON UPDATE SET NULL, "GradeId" INTEGER REFERENCES "public"."Grades" ("id") ON DELETE SET NULL ON UPDATE SET NULL, "active" BOOLEAN NOT NULL DEFAULT TRUE, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL, PRIMARY KEY ("id"));
  
        CREATE TABLE IF NOT EXISTS "${institution.schemaname}"."Classrooms" ("id"   SERIAL, "active" BOOLEAN NOT NULL DEFAULT TRUE, "SubjectId" INTEGER REFERENCES "public"."Subjects" ("id") ON DELETE SET NULL ON UPDATE SET NULL, "LevelId" INTEGER REFERENCES "public"."Levels" ("id") ON DELETE SET NULL ON UPDATE SET NULL, "CourseId" INTEGER REFERENCES "public"."Courses" ("id") ON DELETE SET NULL ON UPDATE SET NULL, "ProfessorId" INTEGER REFERENCES "${institution.schemaname}"."Professors" ("id") ON DELETE SET NULL ON UPDATE SET NULL, "courseName" VARCHAR(255), "description" VARCHAR(255) NOT NULL DEFAULT '', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL, PRIMARY KEY ("id"));
        
        CREATE TABLE IF NOT EXISTS "${institution.schemaname}"."Classroom_Codes" ("id"   SERIAL, "ClassroomId" INTEGER REFERENCES "${institution.schemaname}"."Classrooms" ("id") ON DELETE CASCADE ON UPDATE CASCADE, "class_code" VARCHAR(255) NOT NULL, "path_url" VARCHAR(255) NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL, PRIMARY KEY ("id"));
  
        CREATE TABLE IF NOT EXISTS "${institution.schemaname}"."Classroom_Students" ("id"   SERIAL, "active" BOOLEAN NOT NULL DEFAULT TRUE, "ClassroomId" INTEGER REFERENCES "${institution.schemaname}"."Classrooms" ("id") ON DELETE SET NULL ON UPDATE CASCADE, "StudentId" INTEGER REFERENCES "${institution.schemaname}"."Students" ("id") ON DELETE SET NULL ON UPDATE SET NULL, "absences" INTEGER NOT NULL DEFAULT 0, "attendance" INTEGER NOT NULL DEFAULT 0, "status" VARCHAR(255) NOT NULL DEFAULT '0', "points" FLOAT NOT NULL DEFAULT 0.0, "performance" INTEGER NOT NULL DEFAULT 0, "performance_negative" INTEGER NOT NULL DEFAULT 0, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL, PRIMARY KEY ("id"));
        
        CREATE TABLE IF NOT EXISTS "${institution.schemaname}"."Classroom_Feeds" ("id"   SERIAL, "ClassroomId" INTEGER REFERENCES "${institution.schemaname}"."Classrooms" ("id") ON DELETE CASCADE ON UPDATE CASCADE, "FileId" INTEGER REFERENCES "public"."Files" ("id") ON DELETE SET NULL ON UPDATE SET NULL, "title" VARCHAR(255) NOT NULL, "video_url" VARCHAR(255) DEFAULT NULL, "ProfessorId" INTEGER REFERENCES "${institution.schemaname}"."Professors" ("id") ON DELETE SET NULL ON UPDATE SET NULL, "content_type" VARCHAR(255) NOT NULL, "content" TEXT NOT NULL DEFAULT '', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL, PRIMARY KEY ("id"));
        
        CREATE TABLE IF NOT EXISTS "${institution.schemaname}"."Classroom_Feed_Inquiries" ("id"   SERIAL, "ClassroomFeedId" INTEGER REFERENCES "${institution.schemaname}"."Classroom_Feeds" ("id") ON DELETE CASCADE ON UPDATE CASCADE, "ProfessorId" INTEGER REFERENCES "${institution.schemaname}"."Professors" ("id") ON DELETE SET NULL ON UPDATE SET NULL, "question" TEXT NOT NULL, "type" VARCHAR(255) NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL, PRIMARY KEY ("id"));
        
        CREATE TABLE IF NOT EXISTS "${institution.schemaname}"."Classroom_Feed_Inquiry_Options" ("id"   SERIAL, "ClassroomFeedInquiryId" INTEGER REFERENCES "${institution.schemaname}"."Classroom_Feed_Inquiries" ("id") ON DELETE CASCADE ON UPDATE CASCADE, "correct" BOOLEAN NOT NULL DEFAULT FALSE, "option" TEXT NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL, PRIMARY KEY ("id"));
        
        CREATE TABLE IF NOT EXISTS "${institution.schemaname}"."Classroom_Feed_Inquiry_Answers" ("id"   SERIAL, "ClassroomFeedInquiryId" INTEGER REFERENCES "${institution.schemaname}"."Classroom_Feed_Inquiries" ("id") ON DELETE CASCADE ON UPDATE CASCADE, "ClassroomFeedInquiryOptionId" INTEGER REFERENCES "${institution.schemaname}"."Classroom_Feed_Inquiry_Options" ("id") ON DELETE SET NULL ON UPDATE CASCADE, "StudentId" INTEGER REFERENCES "${institution.schemaname}"."Students" ("id") ON DELETE CASCADE ON UPDATE SET NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL, PRIMARY KEY ("id"));
        
        CREATE TABLE IF NOT EXISTS "${institution.schemaname}"."Classroom_Feed_Comments" ("id"   SERIAL, "ClassroomFeedId" INTEGER REFERENCES "${institution.schemaname}"."Classroom_Feeds" ("id") ON DELETE CASCADE ON UPDATE CASCADE, "ProfessorId" INTEGER REFERENCES "${institution.schemaname}"."Professors" ("id") ON DELETE SET NULL ON UPDATE SET NULL, "StudentId" INTEGER REFERENCES "${institution.schemaname}"."Students" ("id") ON DELETE SET NULL ON UPDATE SET NULL, "UserId" INTEGER REFERENCES "public"."Users" ("id") ON DELETE SET NULL ON UPDATE CASCADE, "content" TEXT NOT NULL, "father" INTEGER DEFAULT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL, PRIMARY KEY ("id"));
        
        CREATE TABLE IF NOT EXISTS "${institution.schemaname}"."Activities" ("id"   SERIAL, "ClassroomId" INTEGER REFERENCES "${institution.schemaname}"."Classrooms" ("id") ON DELETE CASCADE ON UPDATE CASCADE, "active" BOOLEAN NOT NULL, "type" VARCHAR(255) NOT NULL, "title" VARCHAR(255) NOT NULL DEFAULT '', "deadline" TIMESTAMP WITH TIME ZONE NOT NULL, "timer" VARCHAR(255), "description" TEXT NOT NULL DEFAULT '', "total_score" DECIMAL NOT NULL DEFAULT 0, "ActivityDatabaseId" INTEGER DEFAULT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL, PRIMARY KEY ("id"));
        
        CREATE TABLE IF NOT EXISTS "${institution.schemaname}"."Activity_Questions" ("id"   SERIAL, "ActivityId" INTEGER REFERENCES "${institution.schemaname}"."Activities" ("id") ON DELETE CASCADE ON UPDATE CASCADE, "FileId" INTEGER REFERENCES "public"."Files" ("id") ON DELETE SET NULL ON UPDATE CASCADE, "type" VARCHAR(255) NOT NULL, "question" TEXT NOT NULL DEFAULT '', "score" DECIMAL NOT NULL DEFAULT 0, "timer" VARCHAR(255), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL, PRIMARY KEY ("id"));
        
        CREATE TABLE IF NOT EXISTS "${institution.schemaname}"."Activity_Question_Student_Files" ("id"   SERIAL, "ActivityId" INTEGER REFERENCES "${institution.schemaname}"."Activities" ("id") ON DELETE CASCADE ON UPDATE CASCADE, "ActivityQuestionId" INTEGER REFERENCES "${institution.schemaname}"."Activity_Questions" ("id") ON DELETE CASCADE ON UPDATE CASCADE, "StudentId" INTEGER REFERENCES "${institution.schemaname}"."Students" ("id") ON DELETE CASCADE ON UPDATE CASCADE, "FileId" INTEGER REFERENCES "public"."Files" ("id") ON DELETE SET NULL ON UPDATE CASCADE, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL, PRIMARY KEY ("id"));
        
        CREATE TABLE IF NOT EXISTS "${institution.schemaname}"."Activity_Options" ("id"   SERIAL, "ActivityQuestionId" INTEGER REFERENCES "${institution.schemaname}"."Activity_Questions" ("id") ON DELETE CASCADE ON UPDATE CASCADE, "option" VARCHAR(255) NOT NULL, "correct" BOOLEAN NOT NULL DEFAULT FALSE, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL, PRIMARY KEY ("id"));
        
        CREATE TABLE IF NOT EXISTS "${institution.schemaname}"."Activity_Question_Answers" ("id"   SERIAL, "ActivityId" INTEGER REFERENCES "${institution.schemaname}"."Activities" ("id") ON DELETE CASCADE ON UPDATE CASCADE, "ActivityQuestionId" INTEGER REFERENCES "${institution.schemaname}"."Activity_Questions" ("id") ON DELETE CASCADE ON UPDATE CASCADE,"ActivityOptionId" INTEGER REFERENCES "${institution.schemaname}"."Activity_Options" ("id") ON DELETE SET NULL ON UPDATE CASCADE,"StudentId" INTEGER REFERENCES "${institution.schemaname}"."Students" ("id") ON DELETE CASCADE ON UPDATE CASCADE, "answer" TEXT DEFAULT NULL, "revised" INTEGER NOT NULL DEFAULT 0, "correct" BOOLEAN DEFAULT NULL, "question_score" DECIMAL NOT NULL DEFAULT 0, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL, PRIMARY KEY ("id"));
        
        CREATE TABLE IF NOT EXISTS "${institution.schemaname}"."Activity_Results" ("id"   SERIAL, "ActivityId" INTEGER REFERENCES "${institution.schemaname}"."Activities" ("id") ON DELETE SET NULL ON UPDATE CASCADE, "StudentId" INTEGER REFERENCES "${institution.schemaname}"."Students" ("id") ON DELETE SET NULL ON UPDATE CASCADE, "revised" BOOLEAN NOT NULL DEFAULT FALSE, "finalized" BOOLEAN NOT NULL DEFAULT FALSE, "student_score" DECIMAL NOT NULL DEFAULT 0, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL, PRIMARY KEY ("id"));
        
        CREATE TABLE IF NOT EXISTS "${institution.schemaname}"."Activity_Class_Teaches" ("id"   SERIAL, "ClassroomId" INTEGER REFERENCES "${institution.schemaname}"."Classrooms" ("id") ON DELETE CASCADE ON UPDATE CASCADE, "description" TEXT NOT NULL DEFAULT '', "title" VARCHAR(255) NOT NULL DEFAULT '', "deadline" TIMESTAMP WITH TIME ZONE, "active" BOOLEAN NOT NULL DEFAULT FALSE, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL, PRIMARY KEY ("id"));
        
        CREATE TABLE IF NOT EXISTS "${institution.schemaname}"."Activity_Class_Teach_Students" ("id"   SERIAL, "ActivityClassTeachId" INTEGER REFERENCES "${institution.schemaname}"."Activity_Class_Teaches" ("id") ON DELETE CASCADE ON UPDATE CASCADE, "StudentId" INTEGER REFERENCES "${institution.schemaname}"."Students" ("id") ON DELETE CASCADE ON UPDATE CASCADE, "sent" BOOLEAN NOT NULL DEFAULT FALSE, "status" INTEGER DEFAULT 0, "type" VARCHAR(255), "video_url" VARCHAR(255), "FileId" INTEGER REFERENCES "public"."Files" ("id") ON DELETE SET NULL ON UPDATE CASCADE, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL, PRIMARY KEY ("id"));
        `
    )
      .then(res => resolve(res))
      .catch(err => reject(err))
  })
}

const createInstitutionImageUpload = async (req, res, next) => {
  const { file, user, institution } = req;

  const t = await sequelize.transaction();
  try {
    if (!user.roleIds.some(role => role === 1 || role === 4)) {
      throw new APIError("Você não tem permissão para adicionar foto da instituição de ensino.", httpStatus.UNAUTHORIZED);
    }

    const filename = Date.now() + '_' + replaceSpecialChars(path.basename(file.originalname)) + path.extname(file.originalname);
    const filePath = 'static/files/institutions/' + filename
    fs.ensureDir((process.env.NODE_ENV === 'production' ? '/var/www/api.teachlearn.com.br/' : '') + path.dirname(filePath), { mode: 0o2775 }, (err) => {
      if (err) throw new APIError("Erro ao gerar pastas para salvar arquivo.");
      writeFile((process.env.NODE_ENV === 'production' ? '/var/www/api.teachlearn.com.br/' : '') + filePath, file.buffer, (err) => {
        if (err) {
          throw new APIError("Erro ao gravar arquivo.");
        }
      })
    });

    const updatedInstitution = await institution.update({
      photo: (process.env.NODE_ENV === 'production' ? 'https' : req.protocol) + '://' + req.get('host') + '/' + filePath
    }, { transaction: t });

    if (!updatedInstitution) {
      throw new APIError("Houve um erro ao atualizar a foto da instituição.");
    }

    t.commit();

    return res.json({
      success: true,
      url_storage: updatedInstitution.photo,
      message: 'Imagem adicionada com sucesso!'
    })
  } catch (err) {
    t.rollback();

    return res.status(err.status ? err.status : 500).json({
      success: err.status ? err.status : 500,
      message: err.message,
      success: false
    })
  }
}

export default {
  load,
  create,
  listInstitutions,
  changeInstitution,
  searchInstitutions,
  getUf,
  getCity,
  getCEP,
  list,
  createInstitutionImageUpload,
  update
};
