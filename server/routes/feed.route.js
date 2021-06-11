import express from 'express';
import { validate } from 'express-validation';
import paramValidation from '../../config/param-validation';
import feedCtrl from '../controllers/feed.controller';
import expressJwt from "express-jwt";
import config from "../../config/vars";

const router = express.Router(); // eslint-disable-line new-cap

router.route('/')
  /** GET /api/feeds - Get list of feeds */
  .get(expressJwt({
    secret: config.jwtSecret,
  }), feedCtrl.filteredList
  )

  /** POST /api/feeds - Create new feed */
  .post(expressJwt({
    secret: config.jwtSecret,
  }), validate(paramValidation.createFeed, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}), feedCtrl.create);

router.route('/user')
  /** GET /api/feeds/user - Get list of user's feeds */
  .get(expressJwt({
    secret: config.jwtSecret,
  }), feedCtrl.list);

router.route('/approve')
  /** GET /api/feeds/approve - Get list of feeds to approve */
  .get(expressJwt({
    secret: config.jwtSecret,
  }), feedCtrl.listToApprove)

  /** POST /api/feeds/approve - update feed's approved status */
  .post(expressJwt({
    secret: config.jwtSecret,
  }), validate(paramValidation.updateStatusFeed, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}), feedCtrl.changeApproved);

router.route('/:feedId')
  /** GET /api/feeds/:feedId - Get feed by id */
  .get(expressJwt({
    secret: config.jwtSecret,
  }), feedCtrl.get)

  /** PUT /api/feeds/:feedId - update feed by id */
  .put(expressJwt({
    secret: config.jwtSecret,
  }), feedCtrl.update);

router.route('/comments/:feedId')
  /** GET /api/feeds/comments/:feedId - get feed list comment */
  .get(expressJwt({
    secret: config.jwtSecret,
  }), feedCtrl.listAllComments)
  /** POST /api/feeds/comments/:feedId - create feed comment */
  .post(expressJwt({
    secret: config.jwtSecret,
  }), validate(paramValidation.createComment, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}), feedCtrl.createComment);

router.route('/comments/:commentId')
  /** PUT /api/feeds/commenst/:commentId - update feed comment */
  .put(expressJwt({
    secret: config.jwtSecret,
  }), validate(paramValidation.updateComment, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}), feedCtrl.updateComment)
  /** DELETE /api/feeds/comments/:commentId - delete feed comment */
  .delete(expressJwt({
    secret: config.jwtSecret,
  }), feedCtrl.deleteComment);

router.route('/nested-comments/:commentId')
  /** GET /api/feeds/nested-comments/:commentId - get nested comments */
  .get(expressJwt({
    secret: config.jwtSecret,
  }), feedCtrl.getComment);

router.route('/inquiries/:inquiryId')
  /** GET /api/feeds/inquiries/:inquiryId - get inquiry data */
  .get(expressJwt({
    secret: config.jwtSecret,
  }), feedCtrl.viewInquiryPercentage);

router.route('/inquiry-option/:optionId')
  /** DELETE /api/feeds/inquiry-option/:optionId - delete inquiry option */
  .delete(expressJwt({
    secret: config.jwtSecret,
  }), feedCtrl.removeInquiryOption);

router.route('/inquiry-option/:inquiryId')
  /** POST /api/feeds/inquiry-option - create inquiry option */
  .post(expressJwt({
    secret: config.jwtSecret,
  }), validate(paramValidation.createInquiryOption, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}), feedCtrl.createInquiryOption);

router.route('/inquiry-answer/:optionId')
  /** POST /api/feeds/inquiry-answer/:optionId - create inquiry answer */
  .post(expressJwt({
    secret: config.jwtSecret,
  }), validate(paramValidation.createInquiryAnswer, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}), feedCtrl.respondInquiry);

router.route('/inquiry-answer/:inquiryId')
  /** GET /api/feeds/inquiry-answer/:inquiryId - list inquiry answers by inquiryId */
  .get(expressJwt({
    secret: config.jwtSecret,
  }), feedCtrl.listInquiryAnswers);

export default router;