import express from 'express';
import { validate } from 'express-validation';
import paramValidation from '../../config/param-validation';
import workshopCtrl from '../controllers/workshop.controller';
import expressJwt from "express-jwt";
import config from "../../config/vars";
import multer from 'multer';

const storage = multer.memoryStorage();

const upload = multer({ storage: storage });

const router = express.Router(); // eslint-disable-line new-cap

router.route('/courses')

  /** GET /api/workshops - Get list of workshops */
  .get(expressJwt({
    secret: config.jwtSecret,
  }), workshopCtrl.list
  )

  /** POST /api/workshops - Create new workshop */
  .post(expressJwt({
    secret: config.jwtSecret,
  }), validate(paramValidation.createWorkshop, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}), workshopCtrl.create);

router.route('/courses/:workshopId')

  /** GET /api/workshops/:workshopId - Get workshop */
  .get(expressJwt({
    secret: config.jwtSecret,
  }), workshopCtrl.get)

  /** PUT /api/workshops/:workshopId - Update workshop */
  .put(expressJwt({
    secret: config.jwtSecret,
  }), validate(paramValidation.updateWorkshop, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}), workshopCtrl.update)

  /** DELETE /api/workshops/:workshopId - Delete workshop */
  .delete(expressJwt({
    secret: config.jwtSecret,
  }), workshopCtrl.remove);

router.route('/modules')

  /** GET /api/workshops/modules - Get list of workshops */
  .get(expressJwt({
    secret: config.jwtSecret,
  }), workshopCtrl.listModules
  )

  /** POST /api/workshops/modules - Create new workshop */
  .post(expressJwt({
    secret: config.jwtSecret,
  }), validate(paramValidation.createWorkshopModule, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}), workshopCtrl.createModule);

router.route('/modules/:workshopModuleId')

  /** GET /api/workshops/modules/:workshopModuleId - Get workshop */
  .get(expressJwt({
    secret: config.jwtSecret,
  }), workshopCtrl.getModule)

  /** PUT /api/workshops/modules/:workshopModuleId - Update workshop */
  .put(expressJwt({
    secret: config.jwtSecret,
  }), validate(paramValidation.updateWorkshopModule, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}), workshopCtrl.updateModule)

  /** DELETE /api/workshops/modules/:workshopModuleId - Delete workshop */
  .delete(expressJwt({
    secret: config.jwtSecret,
  }), workshopCtrl.removeModule);

router.route('/classes')

  /** GET /api/workshops/classes - Get list of workshops */
  .get(expressJwt({
    secret: config.jwtSecret,
  }), workshopCtrl.listModulesClass
  )

  /** POST /api/workshops/classes - Create new workshop */
  .post(expressJwt({
    secret: config.jwtSecret,
  }), validate(paramValidation.createWorkshopModuleClasses, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}), workshopCtrl.createModuleClass);

router.route('/classes/:workshopModuleClassId')

  /** GET /api/workshops/classes/:workshopModuleClassId - Get workshop */
  .get(expressJwt({
    secret: config.jwtSecret,
  }), workshopCtrl.getModuleClass)

  /** PUT /api/workshops/classes/:workshopModuleClassId - Update workshop */
  .put(expressJwt({
    secret: config.jwtSecret,
  }), validate(paramValidation.updateWorkshopModuleClasses, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}), workshopCtrl.updateModuleClass)

  /** DELETE /api/workshops/classes/:workshopModuleClassId - Delete workshop */
  .delete(expressJwt({
    secret: config.jwtSecret,
  }), workshopCtrl.removeModuleClass);

router.route('/annotations/:workshopModuleClassAnnotationId')
  /** POST /api/workshops/annotations - Create new workshop */
  .post(expressJwt({
    secret: config.jwtSecret,
  }), validate(paramValidation.createWorkshopModuleClassAnnotation, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}), workshopCtrl.addWorkshopModuleClassAnnotation);

router.route('/upload/:workshopId')
  .post(
    expressJwt({ secret: config.jwtSecret }),
    upload.single('avatar'),
    workshopCtrl.createWorkshopImageUpload
  )

/** Load user when API with workshopId route parameter is hit */
router.param('workshopId', workshopCtrl.load);

export default router;
