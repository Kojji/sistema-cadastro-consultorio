import express from 'express';
import { validate, Joi } from 'express-validation';
import paramValidation from '../../config/param-validation';
import userCtrl from '../controllers/user.controller';
import expressJwt from "express-jwt";
import config from "../../config/vars";
import multer from 'multer';
import path from 'path';

const storage = multer.memoryStorage();

const upload = multer({ storage: storage });

const router = express.Router(); // eslint-disable-line new-cap

router.route('/register')
  .post(validate(paramValidation.registerUser, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}), userCtrl.register
  );
router.route('/fetch')

  /** GET /api/users/fetch - Get list of users by name */
  .get(expressJwt({
    secret: config.jwtSecret,
  }), userCtrl.fetchUser
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

router.route('/send-email-activation/:userId')
  .post(expressJwt({
    secret: config.jwtSecret,
  }), userCtrl.sendEmailActivation);

router.route('/activate-user/:userId')
  .post(expressJwt({
    secret: config.jwtSecret,
  }), userCtrl.activateUser);

router.route('/update-status')
  .post(userCtrl.updateStatus);

router.route('/:userId')

  /** GET /api/users/:userId - Get user */
  .get(expressJwt({
    secret: config.jwtSecret,
  }), userCtrl.get)

  /** PUT /api/users/:userId - Update user */
  .put(expressJwt({
    secret: config.jwtSecret,
  }), validate(paramValidation.updateUser, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}), userCtrl.update);

router.route('/upload/:userId')
  .post(
    expressJwt({ secret: config.jwtSecret }),
    upload.single('file'),
    userCtrl.createUserImageUpload
  )

router.route('/change-password/:userId')
  .put(expressJwt({
    secret: config.jwtSecret,
  }),
    validate(paramValidation.changePassword, {
      context: false,
      keyByField: true,
      statusCode: 400
    }, {}),
    userCtrl.changePassword)

router.route('/confirm-account/:key')
  .put(validate(paramValidation.confirmAccount, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}), (userCtrl.confirmAccount))

router.route('/update-institution-professor/:userId/:institutionId')
  .post(expressJwt({
    secret: config.jwtSecret,
  }),
    userCtrl.updateInstitutionProfessor)

router.route('/areas/:areaId')
  .post(
    expressJwt({ secret: config.jwtSecret }),
    userCtrl.insertAreatoUser
  )
  .delete(
    expressJwt({ secret: config.jwtSecret }),
    userCtrl.removeAreafromUser
  )

/** Load user when API with userId route parameter is hit */
router.param('userId', userCtrl.load);

export default router;
