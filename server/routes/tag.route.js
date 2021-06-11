import express from 'express';
import { validate } from 'express-validation';
import expressJwt from "express-jwt";
import config from "../../config/vars";
import paramValidation from '../../config/param-validation';
import tagCtrl from '../controllers/tag.controller';

const router = express.Router(); // eslint-disable-line new-cap

router.route('/')

  /** GET /api/tags - Get list of question tags */
  .get(expressJwt({
    secret: config.jwtSecret,
  }), tagCtrl.list)

  /** POST /api/tags - create question tag */
  .post(expressJwt({
    secret: config.jwtSecret,
  }), validate(paramValidation.createTag, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}), tagCtrl.create);

router.route('/:tagId')

  /** GET /api/tags/:tagId - Get question tag */
  .get(expressJwt({
    secret: config.jwtSecret,
  }), tagCtrl.get)
  
  /** POST /api/tags/:tagId - update question tag */
  .put(expressJwt({
    secret: config.jwtSecret,
  }), validate(paramValidation.updateTag, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}), tagCtrl.update)
  
  /** DELETE /api/tags/:tagId - remove question tag */
  .delete(expressJwt({
    secret: config.jwtSecret,
  }), tagCtrl.remove);

// router.route('/search')

//   /** GET /api/tags/search?text= - Get list of question tags by similar*/
//   .get(expressJwt({
//     secret: config.jwtSecret,
//   }), tagCtrl.searchLike)

router.route('/:tagId/questions/:questionId')

  /** POST /api/:tagId/questions/:questionId - register tag to database question*/
  .post(expressJwt({
    secret: config.jwtSecret,
  }), tagCtrl.includeTagOnQuestion);

router.route('/questions/:questionTagId')

  /** DELETE /api/questions/:questionTagId - remove tag from database question*/
  .delete(expressJwt({
    secret: config.jwtSecret,
  }), tagCtrl.removeTagOnQuestion);

export default router;