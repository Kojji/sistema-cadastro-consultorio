import express from 'express';
import { validate } from 'express-validation';
import paramValidation from '../../config/param-validation';
import roleCtrl from '../controllers/role.controller';
import expressJwt from "express-jwt";
import config from "../../config/vars";

const router = express.Router(); // eslint-disable-line new-cap

router.route('/')

  /** GET /api/roles - Get list of roles */
  .get(expressJwt({
    secret: config.jwtSecret,
  }), roleCtrl.list
  )

  /** POST /api/roles - Create new role */
  .post(expressJwt({
    secret: config.jwtSecret,
  }), validate(paramValidation.createRole, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}), roleCtrl.create);

router.route('/:roleId')

  /** GET /api/roles/:roleId - Get role */
  .get(expressJwt({
    secret: config.jwtSecret,
  }), roleCtrl.get)

  /** PUT /api/roles/:roleId - Update role */
  .put(expressJwt({
    secret: config.jwtSecret,
  }), validate(paramValidation.updateRole, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}), roleCtrl.update);

/** Load user when API with roleId route parameter is hit */
router.param('roleId', roleCtrl.load);

export default router;
