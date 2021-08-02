import express from 'express';
import { validate } from 'express-validation';
import expressJwt from 'express-jwt';
import paramValidation from '../../config/param-validation';
import appointmentCtrl from '../controllers/appointment.controller';
import config from '../../config/vars'

const router = express.Router(); // eslint-disable-line new-cap

router.route('/')
  //GET /api/appointments - Get list of patients forms
  .get(expressJwt({
    secret: config.jwtSecret,
  }),appointmentCtrl.list)
  //POST /api/appointments - Creates patient form
  .post(expressJwt({
    secret: config.jwtSecret,
  }),validate(paramValidation.createAppointment, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}), appointmentCtrl.create);

router.route('/appointment/:appointmentId')
  //GET /api/appointments/appointment/:patientId - Get patient form
  .get(expressJwt({
    secret: config.jwtSecret,
  }),appointmentCtrl.get)
  //PUT /api/appointments/appointment/:patientId - Update patient form
  .put(expressJwt({
    secret: config.jwtSecret,
  }),validate(paramValidation.updateAppointment, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}),appointmentCtrl.update);

router.route('/limited')
  //GET /api/appointments/limited - Get agenda without personal info
  .get(appointmentCtrl.listLimited);

export default router;
