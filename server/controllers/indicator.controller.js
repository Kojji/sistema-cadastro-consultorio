import httpStatus from 'http-status';
import db from '../models';
import APIError from '../helpers/APIError';
import moment from 'moment';

const { sequelize, Institution, Classroom, Professor, Student } = db;

/**
 * Get indicator list.
 * @returns {Indicator[]}
 */
const list = async (req, res, next) => {
  const { dtini, dtfim, dtType, subtract, past } = req.query;
  const { user } = req;

  try {
    if (!user.roleIds.includes(1)) {
      throw new APIError("Você não tem permissão para acessar este local.");
    }

    // const schemas = await sequelize.showAllSchemas();
    const institutions = await Institution.findAndCountAll({raw: true})

    let by_state = {}

    let institutions_stats = {
      institution_classrooms: 0,
      institution_professors: 0,
      institution_students: 0
    }

    let institutions_general_downtime = {
      institution_classrooms: 0
    }

    let institutions_general_uptime = {
      institution_classrooms: 0
    }

    for (const institution of institutions.rows) {
      if (!!by_state[institution.state]) {
        by_state[institution.state] += 1
      } else {
        by_state[institution.state] = 1
      }

      const institution_classrooms = await Classroom.schema(institution.schemaname).findAndCountAll({where: {active: true}, raw: true})
      const institution_professors = await Professor.schema(institution.schemaname).findAndCountAll({raw: true})
      const institution_students = await Student.schema(institution.schemaname).findAndCountAll({raw: true})

      institutions_stats.institution_classrooms += institution_classrooms.count
      institutions_stats.institution_professors += institution_professors.count
      institutions_stats.institution_students += institution_students.count
      
      // Salas de aulas inativas são aquelas que estão a mais de 1 mês sem nenhuma atualização
      // A sala de aula é atualizada toda vez que o professor faz um GET em /classrooms/:classroomId
      institution_classrooms.rows.forEach(classroom => {
        const updated_at = moment(classroom.updatedAt);
        const today = moment();

        const diff = today.diff(updated_at, 'months');

        if (diff > 0) {
          institutions_general_downtime.institution_classrooms += 1
        }

        if (diff === 0) {
          institutions_general_uptime.institution_classrooms += 1
        }
      })
      
    }


    return res.json({
      success: true,
      data: {
        institutions_count_total: institutions.count,
        institutions_count_by_state: by_state,
        institutions_stats,
        institutions_general_downtime,
        institutions_general_uptime
      }
    })
  } catch (err) {
    return res.status(err.status ? err.status : 500).json({
      success: false,
      message: err.message
    })
  }
}

export default {
  list
};
