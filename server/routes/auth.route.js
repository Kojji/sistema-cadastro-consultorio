import express from 'express';
import { validate, Joi } from 'express-validation';
import expressJwt from 'express-jwt';
import paramValidation from '../../config/param-validation';
import authCtrl from '../controllers/auth.controller';
import config from '../../config/vars'

const router = express.Router(); // eslint-disable-line new-cap

/**
 * POST /api/auth/login - Returns token if correct username and password is provided
 */
router.route('/login')
  .post(validate(paramValidation.login, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}), authCtrl.login);

router.route('/token')
  .post(expressJwt({ secret: config.jwtSecret }), authCtrl.token);

router.route('/ask-reset-password')
  .post(validate(paramValidation.askResetPassword, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}), authCtrl.askResetPassword);

router.route('/reset-password/:key')
  .get(authCtrl.resetPassword);

router.route('/post-reset-password')
  .post(validate(paramValidation.postResetPassword, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}), authCtrl.postResetPassword);

export default router;
