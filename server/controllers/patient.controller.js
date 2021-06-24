import APIError from '../helpers/APIError';
import db from '../models';
import { Op } from 'sequelize';

const { Patient,
  sequelize 
} = db;

// Get patient form
const get = async (req, res) => {
  const { patientId } = req.params
  try {
    const patientFound = await Patient.findOne({
      where: {
        id: patientId
      },
      attributes: {
        exclude: ['updatedAt']
      },
    })

    if (!patientFound) {
      throw new APIError("Paciente não encontrado.");
    }
    return res.json({
      user: patientFound,
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

// Creates patient form
const create = async (req, res) => {
  const { name, externalFile, phone, cpf } = req.body;

  const t = await sequelize.transaction();
  try {
    const foundPatient = await Patient.findOne({
      where: {
        name,
        cpf
      }, attributes: ['id', 'cpf']
    })
    if(foundPatient) {
      throw new APIError("Um cadastro com este nome e cpf já foi gerado.");
    }
    
    const createdPatient = await Patient.create({
      name,
      externalFile,
      phone,
      cpf,
      active: true
    }, {transaction: t})

    if(!createdPatient)
      throw new APIError("Houve um erro ao cadastrar paciente.");

    await t.commit();
    return res.json({
      message: "Paciente cadastrado com sucesso!",
      data: createdPatient,
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

// Update patient form
const update = async (req, res) => {
  const { name, externalFile, phone, cpf, active=true } = req.body;
  const { patientId } = req.params;

  const u = await sequelize.transaction();
  try {
    const foundExistintPatient = await Patient.findOne({
      where: {
        name,
        cpf,
        id:{[Op.not]: patientId}
      }, attributes: ['id']
    })
    if(foundExistintPatient) {
      throw new APIError("Um cadastro com este nome e cpf já foi gerado.");
    }
    const foundPatient = await Patient.findOne({
      where: {
        id: patientId
      }, attributes: ['id']
    })
    if(!foundPatient) {
      throw new APIError("Houve um erro ao encontrar a ficha do paciente.");
    }
    
    const updatedPatient = await foundPatient.update({
      name,
      externalFile,
      phone,
      cpf,
      active
    }, {transaction: u})

    if(!updatedPatient)
      throw new APIError("Houve um erro ao atualizar informações do paciente.");

    await u.commit();
    return res.json({
      message: "Paciente atualizado com sucesso!",
      data: updatedPatient,
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

// List patient forms
const list = async (req, res) => {
  const { limit = 20, page = 1, active=true, search=null } = req.query;
  const offset = 0 + (parseInt(page) - 1) * limit;
  try {
    let where = {}
    if (!!search) {
      where = {
        [Op.or]: {
          name: {
            [Op.iLike]: `%${search}%`
          },
          cpf: {
            [Op.iLike]: `%${search}%`
          }
        }
      }
    }
    where = {...where, active}
    const patients = await Patient.findAndCountAll({
      where,
      attributes: {
        exclude:['updatedAt']
      },
      order: [['name', 'ASC']],
      limit,
      offset
    })
    if(!patients)
      throw new APIError("Houve um erro ao listar fichas de pacientes.");

    return res.json({
      success: true,
      patients: patients.rows,
      pagination: {
        limit,
        offset,
        page: parseInt(page),
        count: patients.count,
        nextPage: offset + limit <= patients.count
      }
    })
  } catch (err) {
    return res.status(err.status ? err.status : 500).json({
      success: false,
      message: err.message
    })
  }
}

export default { get, create, update, list }
