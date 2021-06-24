import express from 'express';
import { validate } from 'express-validation';
import expressJwt from 'express-jwt';
import paramValidation from '../../config/param-validation';
import authCtrl from '../controllers/auth.controller';
import config from '../../config/vars'

const router = express.Router(); // eslint-disable-line new-cap

router.route('/login')
  // POST /api/auth/login - Returns token if correct username and password is provided
  .post(validate(paramValidation.login, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}), authCtrl.login);

router.route('/token')
  // POST /api/auth/token - update token
  .post(expressJwt(
    { secret: config.jwtSecret }
  ),authCtrl.token);

export default router;
