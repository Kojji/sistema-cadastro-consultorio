import express from 'express';
import { validate } from 'express-validation';
import paramValidation from '../../config/param-validation';
import userCtrl from '../controllers/user.controller';
import expressJwt from "express-jwt";
import config from "../../config/vars";
// import multer from 'multer';

// const storage = multer.memoryStorage();

// const upload = multer({ storage: storage });

const router = express.Router(); // eslint-disable-line new-cap

router.route('/register')
  .post(validate(paramValidation.registerUser, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}), userCtrl.register
  );

router.route('/edit/:userId')

  /** GET /api/users/fetch - Get list of users by name */
  .put(expressJwt({
    secret: config.jwtSecret,
  }),validate(paramValidation.editUser, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}), userCtrl.updateByAdmin
  );

router.route('/')

  /** GET /api/users - Get list of users */
  .get(expressJwt({
    secret: config.jwtSecret,
  }), userCtrl.list
  )

  /** POST /api/users - Create new user */
  .post(expressJwt({
    secret: config.jwtSecret,
  }), validate(paramValidation.createUser, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}), userCtrl.create);

router.route('/reset/:userId')
  .post(expressJwt({
    secret: config.jwtSecret,
  }), userCtrl.resetPassword);

router.route('/user/:userId')

  /** GET /api/users/user/:userId - Get user */
  .get(expressJwt({
    secret: config.jwtSecret,
  }), userCtrl.get)

  /** PUT /api/users/user/:userId - Update user */
  .put(expressJwt({
    secret: config.jwtSecret,
  }), validate(paramValidation.updateUser, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}), userCtrl.update);

// router.route('/upload')
//   .post(
//     expressJwt({ secret: config.jwtSecret }),
//     upload.single('file'),
//     userCtrl.createUserImageUpload
//   )

router.route('/change-password')
  .post(expressJwt({
    secret: config.jwtSecret,
  }),
    validate(paramValidation.changePassword, {
      context: false,
      keyByField: true,
      statusCode: 400
    }, {}),
    userCtrl.changePassword)

router.route('/change-login')
  .post(expressJwt({
    secret: config.jwtSecret,
  }),
    validate(paramValidation.changeLogin, {
      context: false,
      keyByField: true,
      statusCode: 400
    }, {}),
    userCtrl.changeEmailUsername)

export default router;
