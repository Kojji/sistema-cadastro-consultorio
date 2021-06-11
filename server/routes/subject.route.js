import express from 'express';
import { validate } from 'express-validation';
import paramValidation from '../../config/param-validation';
import subjectCtrl from '../controllers/subject.controller';
import expressJwt from "express-jwt";
import config from "../../config/vars";

const router = express.Router(); // eslint-disable-line new-cap

router.route('/')

  /** GET /api/subjects - Get list of subjects */
  .get(expressJwt({
    secret: config.jwtSecret,
  }), subjectCtrl.list
  )

  /** POST /api/subjects - Create new subject */
  .post(expressJwt({
    secret: config.jwtSecret,
  }), validate(paramValidation.createSubject, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}), subjectCtrl.create);

router.route('/:subjectId')

  /** GET /api/subjects/:subjectId - Get subject */
  .get(expressJwt({
    secret: config.jwtSecret,
  }), subjectCtrl.get)

  /** PUT /api/subjects/:subjectId - Update subject */
  .put(expressJwt({
    secret: config.jwtSecret,
  }), validate(paramValidation.updateSubject, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}), subjectCtrl.update)

  /** DELETE /api/subjects/:subjectId - Delete subject */
  .delete(expressJwt({
    secret: config.jwtSecret,
  }), subjectCtrl.remove);

/** Load user when API with subjectId route parameter is hit */
router.param('subjectId', subjectCtrl.load);

export default router;
