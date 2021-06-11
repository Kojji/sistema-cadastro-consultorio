import express from 'express';
import { validate } from 'express-validation';
import expressJwt from "express-jwt";
import config from "../../config/vars";
import paramValidation from '../../config/param-validation';
import flagCtrl from '../controllers/flag.controller';

const router = express.Router(); // eslint-disable-line new-cap

router.route('/')

  /** GET /api/flags - Get list of question flags */
  .get(expressJwt({
    secret: config.jwtSecret,
  }), flagCtrl.list)

  /** POST /api/flags - create question tag */
  .post(expressJwt({
    secret: config.jwtSecret,
  }), validate(paramValidation.createFlag, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}), flagCtrl.create);

router.route('/:flagId')

  /** GET /api/flags/:flagId - Get question flag */
  .get(expressJwt({
    secret: config.jwtSecret,
  }), flagCtrl.get)
  
  /** POST /api/flags/:flagId - update question flag */
  .put(expressJwt({
    secret: config.jwtSecret,
  }), validate(paramValidation.updateFlag, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}), flagCtrl.update)

  /** DELETE /api/flags/:flagId - remove question flag */
  .delete(expressJwt({
    secret: config.jwtSecret,
  }), flagCtrl.remove);

// router.route('/search')

//   /** GET /api/flags/search?text= - Get list of question flags by similar*/
//   .get(expressJwt({
//     secret: config.jwtSecret,
//   }), flagCtrl.searchLike)

router.route('/:flagId/questions/:questionId')

  /** POST /api/:flagId/questions/:questionId - register flag to database question*/
  .post(expressJwt({
    secret: config.jwtSecret,
  }), flagCtrl.includeFlagOnQuestion);

router.route('/questions/:questionFlagId')

  /** DELETE /api/questions/:questionFlagId - remove flag from database question*/
  .delete(expressJwt({
    secret: config.jwtSecret,
  }), flagCtrl.removeFlagOnQuestion);

export default router;