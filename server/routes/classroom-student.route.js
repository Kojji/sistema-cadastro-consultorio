import express from 'express';
import { validate } from 'express-validation';
import paramValidation from '../../config/param-validation';
import classroomStudentCtrl from '../controllers/classroom-student.controller';
import expressJwt from "express-jwt";
import config from "../../config/vars";

const router = express.Router(); // eslint-disable-line new-cap

router.route('/')

  /** GET /api/classroom-students - Get list of classrooms student */
  .get(expressJwt({
    secret: config.jwtSecret,
  }), classroomStudentCtrl.list
  );

router.route('/:classroomStudentId')

  /** GET /api/classroom-students/:classroomStudentId - Get classroom student */
  .get(expressJwt({
    secret: config.jwtSecret,
  }), classroomStudentCtrl.get)

  /** PUT /api/classroom-students/:classroomStudentId - Update classroom student */
  .put(expressJwt({
    secret: config.jwtSecret,
  }), validate(paramValidation.updateClassroomStudent, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}), classroomStudentCtrl.update);

export default router;
