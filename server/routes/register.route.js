import express from 'express';
import { validate, Joi } from 'express-validation';
import paramValidation from '../../config/param-validation';
import registerCtrl from '../controllers/register.controller';
import expressJwt from "express-jwt";
import config from "../../config/vars";

const router = express.Router(); // eslint-disable-line new-cap

router.route('/')
  /** GET /api/register - Register new Professor into the system */
  .post(validate(paramValidation.postRegister, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}), registerCtrl.firstSubmit);

router.route('/confirm')
  .get(registerCtrl.userConfirmation);

router.route('/confirm/:userId')
  .post(registerCtrl.postUserConfirmation);

router.route('/activate-account/:key')
  .post(registerCtrl.activateAccount);

router.route('/student/:institutionId/:classCode')
  .get(registerCtrl.getStudentEnrollment)
  .post(registerCtrl.studentEnrollment);

/** Load user when API with userId route parameter is hit */
router.param('userId', registerCtrl.load);

export default router;
