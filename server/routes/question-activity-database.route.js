import express from 'express';
import { validate } from 'express-validation';
import expressJwt from "express-jwt";
import config from "../../config/vars";
import paramValidation from '../../config/param-validation';
import questionDbCtrl from '../controllers/question-database.controller';
import activityDbCtrl from '../controllers/activity-database.controller';

const router = express.Router(); // eslint-disable-line new-cap

router.route('/questions')

  /** GET /api/database/questions - Get list of questions */
  .get(expressJwt({
    secret: config.jwtSecret,
  }), questionDbCtrl.list)

  /** POST /api/database/questions - create question */
  .post(expressJwt({
    secret: config.jwtSecret,
  }), validate(paramValidation.createDBQuestion, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}), questionDbCtrl.createQuestion);

router.route('/questions/:questionId')

  /** DELETE /api/database/questions/:questionId - delete database question */
  .delete(expressJwt({
    secret: config.jwtSecret,
  }), questionDbCtrl.deleteQuestion)

  /** PUT /api/database/questions/:questionId - edit database question */
  .put(expressJwt({
    secret: config.jwtSecret,
  }), validate(paramValidation.updateDBQuestion, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}), questionDbCtrl.updateQuestion);

router.route('/question-options/:questionId')

  /** POST /api/database/question-options/:questionId - create database question option */
  .post(expressJwt({
    secret: config.jwtSecret,
  }), validate(paramValidation.createDBQuestionOption, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}), questionDbCtrl.createOption);

router.route('/question-options/:optionId')

  /** DELETE /api/database/question-options/:optionId - delete database question option */
  .delete(expressJwt({
    secret: config.jwtSecret,
  }), questionDbCtrl.deleteOption);

router.route('/activities')

  /** GET /api/database/activities - Get user list of database activities */
  .get(expressJwt({
    secret: config.jwtSecret,
  }), activityDbCtrl.list)

  /** POST /api/database/activities - create database activity */
  .post(expressJwt({
    secret: config.jwtSecret,
  }), validate(paramValidation.createDBActivity, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}), activityDbCtrl.createActivity);

router.route('/activities/:activityId')

  /** GET /api/database/activities/:activityId - Get database activities */
  .get(expressJwt({
    secret: config.jwtSecret,
  }), activityDbCtrl.getActivity)

  /** PUT /api/database/activities/:activityId - edit database activity */
  .put(expressJwt({
    secret: config.jwtSecret,
  }), validate(paramValidation.updateDBActivity, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}), activityDbCtrl.editActivity)

  /** DELETE /api/database/activities/:activityId - delete database activity */
  .delete(expressJwt({
    secret: config.jwtSecret,
  }), activityDbCtrl.deleteActivity);

router.route('/activity-questions/:activityId')

  /** POST /api/database/activity-questions/:activityId - create database activity question */
  .post(expressJwt({
    secret: config.jwtSecret,
  }), validate(paramValidation.createDBActivityQuestion, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}), activityDbCtrl.createActivityQuestion);

router.route('/activity-questions/:questionId')

  /** PUT /api/database/activity-questions/:questionId - update database activity question */
  .put(expressJwt({
    secret: config.jwtSecret,
  }), validate(paramValidation.updateDBActivityQuestion, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}), activityDbCtrl.editActivityQuestion)

  /** DELETE /api/database/activity-questions/:questionId - delete database activity question */
  .delete(expressJwt({
    secret: config.jwtSecret,
  }), activityDbCtrl.deleteActivityQuestion);

router.route('/activity-options/:questionId')

  /** POST /api/database/activity-options/:questionId - create database activity question option */
  .post(expressJwt({
    secret: config.jwtSecret,
  }), validate(paramValidation.createDBActivityOption, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}), activityDbCtrl.createActivityOption);

router.route('/activity-options/:optionId')

  /** DELETE /api/database/activity-options/:optionId - delete database activity question option */
  .delete(expressJwt({
    secret: config.jwtSecret,
  }), activityDbCtrl.deleteActivityOption);

router.route('/activities/copy/:classroomActivityId')

  /** POST /api/database/activities/copy/:classroomActivityId - create database activity from classroom activity */
  .post(expressJwt({
    secret: config.jwtSecret,
  }), validate(paramValidation.copyActivityToDB, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}), activityDbCtrl.copyFromActivityToDatabase);

router.route('/quiz')
  .get(expressJwt({
    secret: config.jwtSecret,
  }), questionDbCtrl.getRandomQuestionDb);

router.route('/quiz/:questionId')
  .post(expressJwt({
    secret: config.jwtSecret,
  }), validate(paramValidation.randomQuestionDb, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}), questionDbCtrl.postRandomQuestionDb);
  
export default router;