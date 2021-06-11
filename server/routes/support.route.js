import express from 'express';
import { validate } from 'express-validation';
import paramValidation from '../../config/param-validation';
import supportCtrl from '../controllers/support.controller';
import expressJwt from "express-jwt";
import config from "../../config/vars";

const router = express.Router(); // eslint-disable-line new-cap

router.route('/')

  /** GET /api/supports - Get list of supports */
  .get(expressJwt({
    secret: config.jwtSecret,
  }), supportCtrl.list
  )

  /** POST /api/supports - Create new support */
  .post(expressJwt({
    secret: config.jwtSecret,
  }), validate(paramValidation.createSupport, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}), supportCtrl.create);

router.route('/:supportId')

  /** GET /api/supports/:supportId - Get support */
  .get(expressJwt({
    secret: config.jwtSecret,
  }), supportCtrl.get)

  /** PUT /api/supports/:supportId - Update support */
  .put(expressJwt({
    secret: config.jwtSecret,
  }), validate(paramValidation.updateSupport, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}), supportCtrl.update)

  /** DELETE /api/supports/:supportId - Delete support */
  .delete(expressJwt({
    secret: config.jwtSecret,
  }), supportCtrl.remove);

/** Load user when API with supportId route parameter is hit */
router.param('supportId', supportCtrl.load);

export default router;
