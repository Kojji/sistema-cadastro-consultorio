import express from 'express';
import { validate } from 'express-validation';
import paramValidation from '../../config/param-validation';
import entranceExamCtrl from '../controllers/entrance-exam.controller';
import expressJwt from "express-jwt";
import config from "../../config/vars";
import multer from 'multer';

const storage = multer.memoryStorage();

const upload = multer({ storage: storage });

const router = express.Router(); // eslint-disable-line new-cap

router.route('/enem')

  /** GET /api/entranceExams - Get list of entranceExams */
  .get(expressJwt({
    secret: config.jwtSecret,
  }), entranceExamCtrl.list
  )

  /** POST /api/entranceExams - Create new entranceExam */
  .post(expressJwt({
    secret: config.jwtSecret,
  }), validate(paramValidation.createEntranceExam, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}), entranceExamCtrl.create);

router.route('/enem/:entranceExamId')

  /** GET /api/entranceExams/:entranceExamId - Get entranceExam */
  .get(expressJwt({
    secret: config.jwtSecret,
  }), entranceExamCtrl.get)

  /** PUT /api/entranceExams/:entranceExamId - Update entranceExam */
  .put(expressJwt({
    secret: config.jwtSecret,
  }), validate(paramValidation.updateEntranceExam, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}), entranceExamCtrl.update)

  /** DELETE /api/entranceExams/:entranceExamId - Delete entranceExam */
  .delete(expressJwt({
    secret: config.jwtSecret,
  }), entranceExamCtrl.remove);

router.route('/contents')

  /** GET /api/entranceExams - Get list of entranceExams */
  .get(expressJwt({
    secret: config.jwtSecret,
  }), entranceExamCtrl.listEntranceExamContent
  )

  /** POST /api/entranceExams - Create new entranceExam */
  .post(expressJwt({
    secret: config.jwtSecret,
  }), validate(paramValidation.createEntranceExamContent, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}), entranceExamCtrl.createEntranceExamContent);

router.route('/contents/:entranceExamContentId')

  /** GET /api/entranceExams/:entranceExamId - Get entranceExam */
  .get(expressJwt({
    secret: config.jwtSecret,
  }), entranceExamCtrl.getEntranceExamContent)

  /** PUT /api/entranceExams/:entranceExamId - Update entranceExam */
  .put(expressJwt({
    secret: config.jwtSecret,
  }), validate(paramValidation.updateEntranceExamContent, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}), entranceExamCtrl.updateEntranceExamContent)

  /** DELETE /api/entranceExams/:entranceExamId - Delete entranceExam */
  .delete(expressJwt({
    secret: config.jwtSecret,
  }), entranceExamCtrl.removeEntranceExamContent);


router.route('/annotations/:entranceExamContentAnnotationId')
  /** POST /api/entrance-exams/annotations */
  .post(expressJwt({
    secret: config.jwtSecret,
  }), validate(paramValidation.createEntranceExamContentAnnotation, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}), entranceExamCtrl.addEntranceExamContentAnnotation);

router.route('/upload/:entranceExamId')
  .post(
    expressJwt({ secret: config.jwtSecret }),
    upload.single('avatar'),
    entranceExamCtrl.createEntranceExamImageUpload
  )

/** Load user when API with entranceExamId route parameter is hit */
router.param('entranceExamId', entranceExamCtrl.load);

export default router;
