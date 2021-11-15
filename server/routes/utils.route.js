import express from 'express';
import { validate } from 'express-validation';
import expressJwt from 'express-jwt';
import paramValidation from '../../config/param-validation';
import utilsCtrl from '../controllers/utils.controller';
import config from '../../config/vars'

const router = express.Router(); // eslint-disable-line new-cap

router.route('/postalCode/:postalCode')
  //GET /api/postalCode/:postalCode - Get postal code info
  .get(expressJwt({
    secret: config.jwtSecret,
    algorithms: config.jwtAlgorithm
  }),utilsCtrl.getPostalCode);

export default router;
