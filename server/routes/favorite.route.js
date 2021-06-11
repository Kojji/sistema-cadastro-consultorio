import express from 'express';
import favoriteCtrl from '../controllers/favorite.controller';
import { validate } from 'express-validation';
import paramValidation from '../../config/param-validation';
import expressJwt from "express-jwt";
import config from "../../config/vars";

const router = express.Router(); // eslint-disable-line new-cap

router.route('/')
  /** GET /api/files - Get list of user's favorites */
  .get(
    expressJwt({
      secret: config.jwtSecret,
    }), favoriteCtrl.list
  )

  /** POST /api/files - Create new favorite */
  .post(
    expressJwt({
      secret: config.jwtSecret,
    }),
    validate(paramValidation.createFavorite, {
      context: false,
      keyByField: true,
      statusCode: 400
    }, {}),
    favoriteCtrl.create
  );

router.route('/:FeedId')
  /** DELETE /api/favorites/:FeedId - Delete favorite */
  .delete(
    expressJwt({
      secret: config.jwtSecret,
    }),
    favoriteCtrl.remove
  );


export default router;