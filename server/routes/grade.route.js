import express from 'express';
import { validate } from 'express-validation';
import paramValidation from '../../config/param-validation';
import gradeCtrl from '../controllers/grade.controller';
import expressJwt from "express-jwt";
import config from "../../config/vars";

const router = express.Router(); // eslint-disable-line new-cap

router.route('/')

  /** GET /api/grades - Get list of grades */
  .get(expressJwt({
    secret: config.jwtSecret,
  }), gradeCtrl.list
  )

  /** POST /api/grades - Create new grade */
  .post(expressJwt({
    secret: config.jwtSecret,
  }), validate(paramValidation.createGrade, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}), gradeCtrl.create);

router.route('/:gradeId')

  /** GET /api/grades/:gradeId - Get grade */
  .get(expressJwt({
    secret: config.jwtSecret,
  }), gradeCtrl.get)

  /** PUT /api/grades/:gradeId - Update grade */
  .put(expressJwt({
    secret: config.jwtSecret,
  }), validate(paramValidation.updateGrade, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}), gradeCtrl.update)

  /** DELETE /api/grades/:gradeId - Delete grade */
  .delete(expressJwt({
    secret: config.jwtSecret,
  }), gradeCtrl.remove);

/** Load user when API with gradeId route parameter is hit */
router.param('gradeId', gradeCtrl.load);

export default router;
