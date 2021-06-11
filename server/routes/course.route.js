import express from 'express';
import { validate } from 'express-validation';
import paramValidation from '../../config/param-validation';
import courseCtrl from '../controllers/course.controller';
import expressJwt from "express-jwt";
import config from "../../config/vars";

const router = express.Router(); // eslint-disable-line new-cap

router.route('/')

  /** GET /api/courses - Get list of courses */
  .get(expressJwt({
    secret: config.jwtSecret,
  }), courseCtrl.list
  )

  /** POST /api/courses - Create new course */
  .post(expressJwt({
    secret: config.jwtSecret,
  }), validate(paramValidation.createCourse, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}), courseCtrl.create);

router.route('/:courseId')

  /** GET /api/courses/:courseId - Get course */
  .get(expressJwt({
    secret: config.jwtSecret,
  }), courseCtrl.get)

  /** PUT /api/courses/:courseId - Update course */
  .put(expressJwt({
    secret: config.jwtSecret,
  }), validate(paramValidation.updateCourse, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}), courseCtrl.update)

  /** DELETE /api/courses/:courseId - Delete course */
  .delete(expressJwt({
    secret: config.jwtSecret,
  }), courseCtrl.remove);

/** Load user when API with courseId route parameter is hit */
router.param('courseId', courseCtrl.load);

export default router;
