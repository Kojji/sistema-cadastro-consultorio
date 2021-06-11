import express from 'express';
import { validate, Joi } from 'express-validation';
import paramValidation from '../../config/param-validation';
import fileCtrl from '../controllers/file.controller';
import expressJwt from "express-jwt";
import config from "../../config/vars";
import multer from 'multer';

const storage = multer.memoryStorage();

const upload = multer({ storage: storage });

const router = express.Router(); // eslint-disable-line new-cap

router.route('/')
  /** GET /api/files - Get list of user's files */
  .get(expressJwt({
    secret: config.jwtSecret,
  }), fileCtrl.list
  )

  /** POST /api/files - Create new file */
  .post(expressJwt({
    secret: config.jwtSecret,
  }), upload.single('file'),
    fileCtrl.create);

router.route('/list')
  /** GET /api/files/list - Get list of all files */
  .get(expressJwt({
    secret: config.jwtSecret,
  }), fileCtrl.listAll
  );

router.route('/:fileId')
  /** GET /api/files/:fileId - Get file */
  .get(expressJwt({
    secret: config.jwtSecret,
  }), fileCtrl.get)

  /** PUT /api/files/:fileId - Update file */
  .put(expressJwt({
    secret: config.jwtSecret,
  }),
    validate(paramValidation.updateFile, {
      context: false,
      keyByField: true,
      statusCode: 400
    }, {}), fileCtrl.update);

router.route('/delete/:fileId')
  /** DELETE /api/files/delete/:fileId - delete file */
  .delete(expressJwt({
    secret: config.jwtSecret,
  }), fileCtrl.remove);


export default router;