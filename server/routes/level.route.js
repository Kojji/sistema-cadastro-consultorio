import express from 'express';
import { validate } from 'express-validation';
import paramValidation from '../../config/param-validation';
import levelCtrl from '../controllers/level.controller';
import expressJwt from "express-jwt";
import config from "../../config/vars";

const router = express.Router(); // eslint-disable-line new-cap

router.route('/')

  /** GET /api/levels - Get list of levels */
  .get(expressJwt({
    secret: config.jwtSecret,
  }), levelCtrl.list
  )

  /** POST /api/levels - Create new level */
  .post(expressJwt({
    secret: config.jwtSecret,
  }), validate(paramValidation.createLevel, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}), levelCtrl.create);

router.route('/:levelId')

  /** GET /api/levels/:levelId - Get level */
  .get(expressJwt({
    secret: config.jwtSecret,
  }), levelCtrl.get)

  /** PUT /api/levels/:levelId - Update level */
  .put(expressJwt({
    secret: config.jwtSecret,
  }), validate(paramValidation.updateLevel, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}), levelCtrl.update)

  /** DELETE /api/levels/:levelId - Delete level */
  .delete(expressJwt({
    secret: config.jwtSecret,
  }), levelCtrl.remove);

/** Load user when API with levelId route parameter is hit */
router.param('levelId', levelCtrl.load);

export default router;
