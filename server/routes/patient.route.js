import express from 'express';
import { validate, Joi } from 'express-validation';
import expressJwt from 'express-jwt';
import paramValidation from '../../config/param-validation';
import patientCtrl from '../controllers/patient.controller';
import config from '../../config/vars'

const router = express.Router(); // eslint-disable-line new-cap

router.route('/')
  //GET /api/patients - Get list of patients
  .get(expressJwt({
    secret: config.jwtSecret,
  }),patientCtrl.list)
  //POST /api/patients/ - Creates patient
  .post(expressJwt({
    secret: config.jwtSecret,
  }),validate(paramValidation.createPatient, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}), patientCtrl.create);

router.route('/:patientId')
  //GET /api/patients/:patientId - Get patient
  .get(expressJwt({
    secret: config.jwtSecret,
  }),patientCtrl.get)
  //PUT /api/patients/:patientId - Update patient
  .put(expressJwt({
    secret: config.jwtSecret,
  }),validate(paramValidation.updatePatient, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}),patientCtrl.update);

export default router;
