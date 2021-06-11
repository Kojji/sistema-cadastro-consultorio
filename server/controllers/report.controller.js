import httpStatus from 'http-status';
import db from '../models';
import APIError from '../helpers/APIError';
import moment from 'moment';
import { Op } from 'sequelize';

const { sequelize, Institution, Classroom, Professor, Student, User, Level, Grade, Course, Subject, Report } = db;

const types = {
  Institution,
  Classroom,
  Professor,
  Student,
  User
}

const op_types = [
  {
    label: 'maior que',
    value: 'gt',
    only_on: ['Number', 'Date']
  },
  {
    label: 'maior ou igual a',
    value: 'gte',
    only_on: ['Number', 'Date']
  },
  {
    label: 'menor que',
    value: 'lt',
    only_on: ['Number', 'Date']
  },
  {
    label: 'menor ou igual a',
    value: 'lte',
    only_on: ['Number', 'Date']
  },
  {
    label: 'diferente de',
    value: 'ne',
    only_on: ['Number', 'String', 'Date']
  },
  {
    label: 'igual a',
    value: 'eq',
    only_on: ['Number', 'String', 'Date']
  },
  // 'is': {
  //   label: 'é',
  //   only_on: ['Number', 'String', 'Date']
  // },
  // 'not': {
  //   label: 'não é',
  //   only_on: ['Number', 'String', 'Date']
  // },
  // {
  //   label: 'entre valores',
  //   value: 'between',
  //   only_on: ['Number', 'Date']
  // },
  // {
  //   label: 'diferente de valores',
  //   value: 'notBetween',
  //   only_on: ['Number', 'Date']
  // },
  // {
  //   label: 'em',
  //   value: 'in',
  //   only_on: ['Number', 'Date']
  // },
  // {
  //   label: 'fora de',
  //   value: 'notIn',
  //   only_on: ['Number', 'Date']
  // },
  {
    label: 'contém',
    value: 'iLike',
    only_on: ['String'],
    mask: '%:text'
  },
  {
    label: 'não contém',
    value: 'notILike',
    only_on: ['String'],
    mask: '%:text'
  },
  // {
  //   label: 'começa com',
  //   value: 'startsWith',
  //   only_on: ['String']
  // },
  // {
  //   label: 'termina com',
  //   value: 'endsWith',
  //   only_on: ['String']
  // },
  // {
  //   label: 'subpalavra de',
  //   value: 'substring',
  //   only_on: ['String']
  // },
]

const op_types_next = [
  {
    label: 'e',
    value: 'and'
  },
  {
    label: 'ou',
    value: 'or'
  }
]

const getColumns = (type) => {
  return Object.keys(types[type].rawAttributes)
}

/**
 * Get report list.
 * @returns {Report[]}
 */
const list = async (req, res, next) => {
  const { user } = req;

  try {
    if (!user.roleIds.includes(1)) {
      throw new APIError("Você não tem permissão para acessar este local.");
    }

    const types = [
      {
        label: 'Instituições',
        value: 'Institution',
        columns: [
          'id',
          'name',
          'cep',
          'city',
          'state',
          'district',
          'address',
          'number',
          'complement',
          'phone',
          'active',
          'photo',
          'createdAt',
          'updatedAt'
        ]
      },
      {
        label: 'Professores',
        value: 'Professor',
        columns: getColumns('Professor')
      },
      {
        label: 'Salas de Aula',
        value: 'Classroom',
        columns: getColumns('Classroom')
      },
      {
        label: 'Alunos',
        value: 'Student',
        columns: getColumns('Student')
      },
      {
        label: 'Usuários',
        value: 'User',
        columns: [
          'id',
          'name',
          'username',
          'confirmed',
          'phone',
          'email',
          'active',
          'photo',
          'dtbirth',
          'cpf',
          'rg',
          'profession',
          'createdAt',
          'updatedAt',
          'InstitutionId'
        ]
      }
    ];

    const saved_reports = await Report.findAll({
      attributes: ['id', 'title', 'createdAt']
    })

    return res.json({
      success: true,
      data: {
        types,
        op_types,
        op_types_next,
        saved_reports
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
  const { cols, where, where_next, type, title } = req.body;
  const { user } = req;

  const t = await sequelize.transaction();
  try {
    if (!user.roleIds.includes(1)) {
      throw new APIError("Você não tem permissão para acessar este local.");
    }

    if (!type) {
      throw new APIError("Selecione um tipo de Relatório.");
    }

    const findReports = await Report.findOne({
      where: {
        title,
        cols,
        where,
        where_next,
        type
      }
    })

    if (!!findReports) {
      throw new APIError("Este relatório já está registrado no sistema.");
    }

    const saveReport = await Report.create({
      title,
      cols,
      where,
      where_next,
      type
    }, { transaction: t })

    if (!saveReport) {
      throw new APIError("Houve um erro na hora de salvar o relatório.")
    }

    await t.commit();

    return res.json({
      success: true,
      message: "Relatório criado com sucesso!"
    })
    
  } catch (err) {
    await t.rollback();
    return res.status(err.status ? err.status : 500).json({
      success: false,
      message: err.message
    })
  }
}

const get = async (req, res, next) => {
  const { reportId } = req.params;
  const { user } = req;

  try {
    if (!user.roleIds.includes(1)) {
      throw new APIError("Você não tem permissão para acessar este local.");
    }

    const report = await Report.findOne({where: {id: reportId}, raw: true})

    if (!report) {
      throw new APIError("Este relatório não existe.");
    }

    let getReport = []
    let count = 0

    let where_parsed = JSON.parse(report.where)
    let where_formatted = {}

    if (!!report.where_next) {
      where_formatted = {
        [Op[report.where_next]]: {}
      }
    }

    for (const item of where_parsed) {
      if (!!report.where_next) {
        if (item.target === 'createdAt' || item.target === 'updatedAt') {
          const date = new Date(item.value)
          where_formatted[Op[report.where_next]][item.target] = {
            [Op[item.condition]]: date.toISOString()
          }
        } else {
          where_formatted[Op[report.where_next]][item.target] = {
            [Op[item.condition]]: item.value
          }
        }
      } else {
        where_formatted[item.target] = {
          [Op[item.condition]]: item.value
        }
      }
    }

    const schemas = await sequelize.showAllSchemas();
    const include = []

    switch (report.type) {
      case 'Institution':
        const findReport = await types[report.type].findAndCountAll({
          where: where_formatted,
          attributes: JSON.parse(report.cols)
        })
        getReport = findReport.rows
        count = findReport.count
        break;
      case 'Professor':
        if (JSON.parse(report.cols).includes('UserId')) {
          include.push({
            model: User,
            attributes: ['name', 'email']
          })
        }

        for (const schema of schemas) {
          const findReport = await types[report.type].schema(schema).findAndCountAll({
            where: where_formatted,
            attributes: JSON.parse(report.cols),
            include
          })

          getReport = getReport.concat(findReport.rows)

          count += findReport.count
        }
        break;
      case 'Student':        
        if (JSON.parse(report.cols).includes('UserId')) {
          include.push({
            model: User,
            attributes: ['name', 'email']
          })
        }

        for (const schema of schemas) {
          const findReport = await types[report.type].schema(schema).findAndCountAll({
            where: where_formatted,
            attributes: JSON.parse(report.cols),
            include
          })

          getReport = getReport.concat(findReport.rows)

          count += findReport.count
        }
        break;
      case 'Classroom':
        if (JSON.parse(report.cols).includes('LevelId')) {
          include.push({
            model: Level
          })
        }
        if (JSON.parse(report.cols).includes('GradeId')) {
          include.push({
            model: Grade
          })
        }
        if (JSON.parse(report.cols).includes('CourseId')) {
          include.push({
            model: Course
          })
        }
        if (JSON.parse(report.cols).includes('SubjectId')) {
          include.push({
            model: Subject
          })
        }
        for (const schema of schemas) {
          const findReport = await types[report.type].schema(schema).findAndCountAll({
            where: where_formatted,
            attributes: JSON.parse(report.cols),
            include
          })

          getReport = getReport.concat(findReport.rows)
          count += findReport.count
        }
        break;
      case 'User':
        const findReportUser = await types[report.type].findAndCountAll({
          where: where_formatted,
          attributes: JSON.parse(report.cols),
          include
        })

        getReport = getReport.concat(findReportUser.rows)
        count += findReportUser.count
        break;
    }

    return res.json({
      success: true,
      title: report.title,
      cols: JSON.parse(report.cols),
      data: getReport,
      count
    })
    
  } catch (err) {
    return res.status(err.status ? err.status : 500).json({
      success: false,
      message: err.message
    })
  }
}

const remove = async (req, res, next) => {
  const { reportId } = req.params
  const { user } = req

  const t = await sequelize.transaction();
  try {
    if (!user.roleIds.includes(1)) {
      throw new APIError("Você não tem permissão para acessar este local.");
    }

    const findReport = await Report.findByPk(reportId);

    if (!findReport) {
      throw new APIError("Este relatório não existe.");
    }

    const deletedReport = await findReport.destroy({ transaction: t });

    if (!deletedReport) {
      throw new APIError("Houve uma erro ao excluir o relatório.");
    }

    await t.commit();

    return res.json({
      success: true,
      message: "Reatório excluído com sucesso!"
    });
  } catch (err) {
    await t.rollback();
    return res.status(err.status ? err.status : 500).json({
      success: false,
      message: err.message
    })
  }
}

export default {
  list,
  create,
  get,
  remove
};
