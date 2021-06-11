import express from 'express';
import { validate } from 'express-validation';
import paramValidation from '../../config/param-validation';
import areaCtrl from '../controllers/area.controller';
import userCtrl from '../controllers/user.controller';
import expressJwt from "express-jwt";
import config from "../../config/vars";

const router = express.Router(); // eslint-disable-line new-cap

router.route('/')

  /** GET /api/areas - Get list of areas */
  .get(expressJwt({
    secret: config.jwtSecret,
  }), areaCtrl.list
  )

  /** POST /api/areas - Create new area */
  .post(expressJwt({
    secret: config.jwtSecret,
  }), validate(paramValidation.createArea, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}), areaCtrl.create);

router.route('/user')
  .get(
    expressJwt({ secret: config.jwtSecret }),
    userCtrl.getUserAreas
  )

router.route('/:areaId')

  /** GET /api/areas/:areaId - Get area */
  .get(expressJwt({
    secret: config.jwtSecret,
  }), areaCtrl.get)

  /** PUT /api/areas/:areaId - Update area */
  .put(expressJwt({
    secret: config.jwtSecret,
  }), validate(paramValidation.updateArea, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}), areaCtrl.update)

  /** DELETE /api/areas/:areaId - Delete area */
  .delete(expressJwt({
    secret: config.jwtSecret,
  }), areaCtrl.remove);

/** Load user when API with areaId route parameter is hit */
router.param('areaId', areaCtrl.load);

export default router;
