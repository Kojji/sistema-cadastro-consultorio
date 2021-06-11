import express from 'express';
import { validate } from 'express-validation';
import paramValidation from '../../config/param-validation';
import classroomCtrl from '../controllers/classroom.controller';
import questionDbCtrl from '../controllers/question-database.controller';
import activityDbCtrl from '../controllers/activity-database.controller';
import expressJwt from "express-jwt";
import config from "../../config/vars";

const router = express.Router(); // eslint-disable-line new-cap

router.route('/')

  /** GET /api/classrooms - Get list of classrooms */
  .get(expressJwt({
    secret: config.jwtSecret,
  }), classroomCtrl.list
  )

  /** POST /api/classrooms - Create new classroom */
  .post(expressJwt({
    secret: config.jwtSecret,
  }), validate(paramValidation.createClassroom, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}), classroomCtrl.create);

router.route('/:classroomId')

  /** GET /api/classrooms/:classroomId - Get classroom */
  .get(expressJwt({
    secret: config.jwtSecret,
  }), classroomCtrl.get)

  /** PUT /api/classrooms/:classroomId - Update classroom */
  .put(expressJwt({
    secret: config.jwtSecret,
  }), validate(paramValidation.updateClassroom, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}), classroomCtrl.update)

  /** DELETE /api/classrooms/:classroomId - Delete classroom */
  .delete(expressJwt({
    secret: config.jwtSecret,
  }), classroomCtrl.remove);

router.route('/:classroomId/reactivate')
  .put(expressJwt({
    secret: config.jwtSecret,
  }), classroomCtrl.reactivate)

router.route('/:classroomId/codes')

  /** GET /api/classrooms/:classroomId/codes - Get classroom codes list */
  .get(expressJwt({
    secret: config.jwtSecret,
  }), classroomCtrl.listClassroomCodes)

  /** POST /api/classrooms/:classroomId/codes - Create classroom code */
  .post(expressJwt({
    secret: config.jwtSecret,
  }), classroomCtrl.createCode)

router.route('/:classroomId/feeds')

  /** GET /api/classrooms/:classroomId/feeds - Get classroom feed list */
  .get(expressJwt({
    secret: config.jwtSecret,
  }), classroomCtrl.listClassroomFeed)

  /** POST /api/classrooms/:classroomId/feeds - Create classroom feed */
  .post(expressJwt({
    secret: config.jwtSecret,
  }), validate(paramValidation.createClassroomFeed, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}), classroomCtrl.createClassroomFeed)

router.route('/:classroomId/performance')

  /** GET /api/classrooms/:classroomId/performance - Get classroom performance list */
  .get(expressJwt({
    secret: config.jwtSecret,
  }), classroomCtrl.listClassroomPerformance)

router.route('/feeds/:feedId')

  /** PUT /api/classrooms/feeds/:feedId - Update classroom feed */
  .put(expressJwt({
    secret: config.jwtSecret,
  }), validate(paramValidation.updateClassroomFeed, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}), classroomCtrl.updateClassroomFeed)

router.route('/comments/:feedId')
  /** GET /api/classrooms/comments/:feedId - Get classroom feed comment list */
  .get(expressJwt({
    secret: config.jwtSecret,
  }), classroomCtrl.listClassroomFeedComments)

  /** POST /api/classrooms/comments/:feedId - Create classroom feed comment */
  .post(expressJwt({
    secret: config.jwtSecret,
  }), validate(paramValidation.createClassroomFeedComment, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}), classroomCtrl.createClassroomFeedComment)

router.route('/comments/:commentId')

  /** PUT /api/classrooms/comments/:commentId - Update classroom feed comment */
  .put(expressJwt({
    secret: config.jwtSecret,
  }), validate(paramValidation.updateComment, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}), classroomCtrl.updateClassroomFeedComment)

  /** DELETE /api/classrooms/comments/:commentId - Delete classroom feed comment*/
  .delete(expressJwt({
    secret: config.jwtSecret,
  }), classroomCtrl.removeClassroomFeedComments);

router.route('/nested-comments/:commentId')
  /** GET /api/classrooms/nested-comments/:commentId - Get classroom feed nested comments */
  .get(expressJwt({
    secret: config.jwtSecret,
  }), classroomCtrl.listNestedFeedComments)

router.route('/inquiries/:inquiryId')
  /** GET /api/classrooms/inquiries/:inquiryId - View inquiry percentage */
  .get(expressJwt({
    secret: config.jwtSecret,
  }), classroomCtrl.viewClassroomInquiryPercentage);

router.route('/inquiry-option/:inquiryId')

  /** POST /api/classrooms/inquiry-options/:inquiryId - Create classroom inquiry option */
  .post(expressJwt({
    secret: config.jwtSecret,
  }), validate(paramValidation.createInquiryOption, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}), classroomCtrl.createInquiryOption);

router.route('/inquiry-option/:optionId')

  /** DELETE /api/classrooms/inquiry-options/:inquiryId - Delete classroom inquiry option*/
  .delete(expressJwt({
    secret: config.jwtSecret,
  }), classroomCtrl.removeInquiryOption);

router.route('/inquiry-answer/:optionId')
  /** POST /api/classrooms/inquiry-answer/:optionId - create inquiry answer */
  .post(expressJwt({
    secret: config.jwtSecret,
  }), validate(paramValidation.createInquiryAnswer, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}), classroomCtrl.createInquiryAnswer);

router.route('/inquiry-answer/:inquiryId')
  /** GET /api/classrooms/inquiry-answer/:inquiryId - list inquiry answers by inquiryId */
  .get(expressJwt({
    secret: config.jwtSecret,
  }), classroomCtrl.listInquiryAnswer);

router.route('/:classroomId/activities')

  /** POST /api/classrooms/:classroomId/activities - Create classroom activity */
  .post(expressJwt({
    secret: config.jwtSecret,
  }), validate(paramValidation.createClassroomActivity, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}), classroomCtrl.createActivity)

router.route('/:classroomId/ranking')

  /** GET /api/classrooms/:classroomId/ranking - Get classroom student ranking */
  .get(expressJwt({
    secret: config.jwtSecret,
  }), classroomCtrl.classroomRanking);

router.route('/:classroomId/correct')

  /** GET /api/classrooms/:classroomId/correct - Get list of results to revise */
  .get(expressJwt({
    secret: config.jwtSecret,
  }), classroomCtrl.listResultsToRevise);

router.route('/activities/:activityId')
  /** PUT /api/classrooms/activities/:activityId - UPDATE activitity information */
  .put(expressJwt({
    secret: config.jwtSecret,
  }), validate(paramValidation.updateClassroomActivity, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}), classroomCtrl.updateActivity);

router.route('/activities/:activityId')
  /** DELETE /api/classrooms/activities/:activityId - DELETE activitity information */
  .delete(expressJwt({
    secret: config.jwtSecret,
  }), classroomCtrl.deleteActivity);

  router.route('/:classroomId/activities/professor')

  /** GET /api/classrooms/:classroomId/activities - Get activitity list by classroomId */
  .get(expressJwt({
    secret: config.jwtSecret,
  }), classroomCtrl.listActivitiesProfessor)

  router.route('/:classroomId/activities/student')

  /** GET /api/classrooms/:classroomId/activities - Get activitity list by classroomId */
  .get(expressJwt({
    secret: config.jwtSecret,
  }), classroomCtrl.listActivitiesStudent)

router.route('/activities/professor/:activityId')

  /** GET /api/classrooms/activities/professor/:activityId - Get activitity information */
  .get(expressJwt({
    secret: config.jwtSecret,
  }), classroomCtrl.getActivityProfessor);

router.route('/activities/student/:activityId')

  /** GET /api/classrooms/activities/student/:activityId - Get activitity information */
  .get(expressJwt({
    secret: config.jwtSecret,
  }), classroomCtrl.getActivityStudent);

router.route('/activities/student/start/:activityId')

  /** GET /api/classrooms/activities/student/start/:activityId - Get activity questions and start activity */
  .get(expressJwt({
    secret: config.jwtSecret,
  }), classroomCtrl.beginActivityStudent);

router.route('/activities/student/teste/:activityId')

  /** GET /api/classrooms/activities/student/teste/:activityId - Get activity questions and start type "teste" activity */
  .get(expressJwt({
    secret: config.jwtSecret,
  }), classroomCtrl.beginActivityTeste);

router.route('/activities/start/question/:activityId/:questionId')

  /** GET /api/classrooms/activities/start/question/:activityId/:questionId - Get activity questions and start type "teste" activity */
  .get(expressJwt({
    secret: config.jwtSecret,
  }), classroomCtrl.beginActivityQuestion);

router.route('/activities/finish/question/:activityId/:questionId')

  /** POST /api/classrooms/activities/finish/question/:activityId/:questionId - Finish activity question */
  .post(expressJwt({
    secret: config.jwtSecret,
  }), validate(paramValidation.finishActivityQuestion, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}), classroomCtrl.finalizeActivityQuestion);

router.route('/activities/results/:activityId')

  /** GET /api/classrooms/activities/results/:activityId - Get activitity results */
  .get(expressJwt({
    secret: config.jwtSecret,
  }), classroomCtrl.listActivityResults);

router.route('/activities/results/:resultId')
  /** PUT /api/classrooms/activities/results/:resultId - UPDATE activitity result */
  .put(expressJwt({
    secret: config.jwtSecret,
  }), validate(paramValidation.updateActivityResult, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}), classroomCtrl.updateActivityResult);

router.route('/activities/finish/:activityId')
  /** POST /api/classrooms/activities/finish/:activityId - UPDATE finish activity */
  .post(expressJwt({
    secret: config.jwtSecret,
  }), classroomCtrl.finalizeActivity);
  
router.route('/activity-questions/professor/:questionId')

  /** GET /api/classrooms/activity-questions/:questionId - view classroom activity question */
  .get(expressJwt({
    secret: config.jwtSecret,
  }), classroomCtrl.getActivityQuestionProfessor)

router.route('/activity-questions/:activityId')

  /** POST /api/classrooms/activity-questions/:activityId - Create classroom activity question */
  .post(expressJwt({
    secret: config.jwtSecret,
  }), validate(paramValidation.createActivityQuestion, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}), classroomCtrl.createActivityQuestion)

router.route('/activity-questions/:activityQuestionId')

  /** PUT /api/classrooms/activity-questions/:activityQuestionId - UPDATE classroom activity question */
  .put(expressJwt({
    secret: config.jwtSecret,
  }), validate(paramValidation.updateActivityQuestion, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}), classroomCtrl.updateActivityQuestion)

  /** DELETE /api/classrooms/activity-questions/:activityQuestionId - delete classroom activity question */
  .delete(expressJwt({
    secret: config.jwtSecret,
  }),classroomCtrl.deleteActivityQuestion);

router.route('/activity-options/:questionId')

  /** POST /api/classrooms/activity-options/:questionId - Create classroom activity question option */
  .post(expressJwt({
    secret: config.jwtSecret,
  }), validate(paramValidation.createActivityOption, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}), classroomCtrl.createActivityOption)

router.route('/activity-options/:optionId')

  /** DELETE /api/classrooms/activity-options/:optionId - Delete classroom activity option */
  .delete(expressJwt({
    secret: config.jwtSecret,
  }), classroomCtrl.deleteActivityOption)

router.route('/activity-file/:questionId')

  /** POST /api/classrooms/activity-file/:questionId - Register Files as answers */
  .post(expressJwt({
    secret: config.jwtSecret,
  }), validate(paramValidation.createAnswerFiles, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}), classroomCtrl.answerWithFile)

router.route('/activity-answers/:questionId')

  /** POST /api/classrooms/activity-answer/:questionId - Create classroom activity answer */
  .post(expressJwt({
    secret: config.jwtSecret,
  }), validate(paramValidation.createActivityAnswer, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}), classroomCtrl.createActivityAnswer)

router.route('/activity-answers/:answerId')

  /** PUT /api/classrooms/activity-answers/:answerId - Revise classroom activity answer */
  .put(expressJwt({
    secret: config.jwtSecret,
  }), validate(paramValidation.reviseActivityAnswer, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}), classroomCtrl.reviseActivityAnswer)

router.route('/:activityId/activity-answers/:studentId')

  /** GET /api/classrooms/:activityId/activity-answers/:studentId - List classroom activity answers by user */
  .get(expressJwt({
    secret: config.jwtSecret,
  }), classroomCtrl.listActivityAnswers)

router.route('/:classroomId/database/questions')

  /** GET /api/classrooms/:classroomId/database/questions - List database questions according to classroom */
  .get(expressJwt({
    secret: config.jwtSecret,
  }), questionDbCtrl.filteredList)

router.route('/:activityId/database/question/:databaseQuestionId')

  /** POST /api/classrooms/:activityId/database/question/:databaseQuestionId - create a question copied from database questions */
  .post(expressJwt({
    secret: config.jwtSecret,
  }), validate(paramValidation.copyDBQuestion, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}), questionDbCtrl.copyQuestion)

router.route('/:classroomId/database/activity/:databaseActivityId')

  /** POST /api/classrooms/:classroomId/database/activity/:databaseActivityId - create an activity copied from database activities */
  .post(expressJwt({
    secret: config.jwtSecret,
  }), validate(paramValidation.copyDBToActivity, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}), activityDbCtrl.copyFromDatabaseToActivity)

router.route('/activity-results/:activityId/:studentId')

  /** DELETE /api/classrooms/activity-results/:activityId/:studentId - delete activity result(professor enables student to try "teste" again) */
  .delete(expressJwt({
    secret: config.jwtSecret,
  }), classroomCtrl.resetActivityResult)

router.route('/:classroomId/activity-teach')

  /** POST /api/classrooms/:classroomId/activity-teach - create an "ensine para a turma" activity  */
  .post(expressJwt({
    secret: config.jwtSecret,
  }), validate(paramValidation.createActivityTeachClass, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}), classroomCtrl.createActivityTeach)

router.route('/activity-teach/:activityId')

  /** PUT /api/classrooms/activity-teach/:activityId - edit an "ensine para a turma" activity */
  .put(expressJwt({
    secret: config.jwtSecret,
  }), validate(paramValidation.editActivityTeachClass, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}), classroomCtrl.editActivityTeach)

  /** GET /api/classrooms/activity-teach/:activityId - get activity answer by user.StudentId */
  .get(expressJwt({
    secret: config.jwtSecret,
  }), classroomCtrl.viewActivityAnswerStudent)

router.route('/activity-teach/:activityId/view')
  /** GET /api/classrooms/activity-teach/:activityId/view - get activity info (only professor)*/
  .get(expressJwt({
    secret: config.jwtSecret,
  }), classroomCtrl.viewActivity)
  

router.route('/activity-teach/:activityId/students/add')

/** POST /api/classrooms/activity-teach/:activityId/students/add - insert students into activity  */
.post(expressJwt({
  secret: config.jwtSecret,
}), validate(paramValidation.addStudentsActivityTeachClass, {
  context: false,
  keyByField: true,
  statusCode: 400
}, {}), classroomCtrl.addStudentsToActivity)

router.route('/activity-teach/:activityId/students/remove/:studentId')

/** DELETE /api/classrooms/activity-teach/:activityId/students/remove/:studentId - remove student from activity  */
.delete(expressJwt({
  secret: config.jwtSecret,
}), validate(paramValidation.removeStudentsActivityTeachClass, {
  context: false,
  keyByField: true,
  statusCode: 400
}, {}), classroomCtrl.removeStudentFromActivity)

router.route('/activity-teach/:answerId/answer')

/** POST /api/classrooms/activity-teach/:answerId/answer - answer "ensine para a turma" activity  */
.post(expressJwt({
  secret: config.jwtSecret,
}), validate(paramValidation.answerActivityTeachClass, {
  context: false,
  keyByField: true,
  statusCode: 400
}, {}), classroomCtrl.answerActivityTeach)

router.route('/:classroomId/activity-teach/student')

/** GET /api/classrooms/:classroomId/activity-teach/student - student list "ensine para a turma" activities  */
.get(expressJwt({
  secret: config.jwtSecret,
}), classroomCtrl.listActivityTeachStudent)

router.route('/:classroomId/activity-teach/professor')

/** GET /api/classrooms/:classroomId/activity-teach/professor - professor list "ensine para a turma" activities  */
.get(expressJwt({
  secret: config.jwtSecret,
}), classroomCtrl.listActivityTeachProfessor)

router.route('/activity-teach/:activityId/answers')

/** GET /api/classrooms/activity-teach/:activityId/answers - answer list activities  */
.get(expressJwt({
  secret: config.jwtSecret,
}), classroomCtrl.viewActivityAnswersProfessor)

router.route('/activity-teach/:answerId/revise')

/** POST /api/classrooms/activity-teach/:answerId/revise - revise answer list activities  */
.post(expressJwt({
  secret: config.jwtSecret,
}), validate(paramValidation.reviseAnswerActivityTeachClass, {
  context: false,
  keyByField: true,
  statusCode: 400
}, {}), classroomCtrl.reviseActivityTeach)

router.route('/activity-teach/:answerId/update')

/** PUT /api/classrooms/activity-teach/:answerId/update - update activity answer */
.put(expressJwt({
  secret: config.jwtSecret,
}), validate(paramValidation.updateAnswerActivityTeachClass, {
  context: false,
  keyByField: true,
  statusCode: 400
}, {}), classroomCtrl.editActivityTeachAnswer)

export default router;
