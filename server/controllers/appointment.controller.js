import APIError from '../helpers/APIError';
import db from '../models';
import { Op } from 'sequelize';

const { 
  Patient,
  Appointment,
  sequelize 
} = db;

// Get appointment data
const get = async (req, res) => {
  const { appointmentId } = req.params
  try {
    const appointmentFound = await Appointment.findOne({
      where: {
        id: appointmentId
      }
    })

    if (!appointmentFound) {
      throw new APIError("Consulta não encontrada.");
    }
    return res.json({
      user: appointmentFound,
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

// Creates appointment
const create = async (req, res) => {
  const { 
    PatientId,
    title,
    details,
    date,
    duration,
    time,
    bgcolor,
    active
  } = req.body;
  const { user } = req;

  const t = await sequelize.transaction();
  try {
    
    const createdAppointment = await Appointment.create({
      PatientId,
      UserId: user.id,
      title,
      details,
      date,
      duration,
      time,
      bgcolor,
      active
    }, {transaction: t})

    if(!createdAppointment)
      throw new APIError("Houve um erro marcar consulta.");

    await t.commit();
    return res.json({
      message: "Consulta cadastrada com sucesso!",
      data: createdAppointment,
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

// Update appointment
const update = async (req, res) => {
  const {
    PatientId,
    title,
    details,
    date,
    duration,
    time,
    bgcolor,
    active
  } = req.body;
  const { appointmentId } = req.params;

  const u = await sequelize.transaction();
  try {
    const foundAppointment = await Appointment.findOne({
      where: {
        id: appointmentId
      }, attributes: ['id']
    })
    if(!foundAppointment) {
      throw new APIError("Houve um erro ao encontrar a ficha do paciente.");
    }
    
    const updatedAppointment = await foundAppointment.update({
      PatientId,
      title,
      details,
      date,
      duration,
      time,
      bgcolor,
      active
    }, {transaction: u})

    if(!updatedAppointment)
      throw new APIError("Houve um erro ao atualizar informações da consulta.");

    await u.commit();
    return res.json({
      message: "Consulta atualizada com sucesso!",
      data: updatedAppointment,
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

// List appointments
const list = async (req, res) => {
  const { init=null, final=null } = req.query;
  try {
    if(!init || !final)
      throw new APIError("Data inválida.");

    const foundAppointments = await Appointment.findAndCountAll({
      where: {
        date: {[Op.between]: [init, final]},
        active: true
      },
      include: [
        { model: Patient, attributes: ['id', 'name']}
      ],
      // attributes: ['id', 'final', 'init', 'description'],
      order: [['time', 'ASC']]
    })
    if(!foundAppointments)
      throw new APIError("Houve um erro ao listar fichas de pacientes.");

    return res.json({
      success: true,
      data: foundAppointments.rows
    })
  } catch (err) {
    return res.status(err.status ? err.status : 500).json({
      success: false,
      message: err.message
    })
  }
}

// List appointments
const listLimited = async (req, res) => {
  const { init=null, final=null } = req.query;
  try {
    if(!init || !final)
      throw new APIError("Data inválida.");

    const foundAppointments = await Appointment.findAndCountAll({
      where: {
        date: {[Op.between]: [init, final]},
        active: true
      },
      attributes: ['id', 'date', 'time', 'duration', 'active'],
      order: [['time', 'ASC']]
    })
    if(!foundAppointments)
      throw new APIError("Houve um erro ao listar fichas de pacientes.");

    return res.json({
      success: true,
      data: foundAppointments.rows
    })
  } catch (err) {
    return res.status(err.status ? err.status : 500).json({
      success: false,
      message: err.message
    })
  }
}

export default { get, create, update, list, listLimited }
