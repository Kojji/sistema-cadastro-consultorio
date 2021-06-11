import express from 'express';
import { validate } from 'express-validation';
import paramValidation from '../../config/param-validation';
import studyMaterialCtrl from '../controllers/study-material.controller';
import expressJwt from "express-jwt";
import config from "../../config/vars";
import multer from 'multer';

const storage = multer.memoryStorage();

const upload = multer({ storage: storage });

const router = express.Router(); // eslint-disable-line new-cap

router.route('/items')

  /** GET /api/studyMaterials - Get list of studyMaterials */
  .get(expressJwt({
    secret: config.jwtSecret,
  }), studyMaterialCtrl.list
  )

  /** POST /api/studyMaterials - Create new studyMaterial */
  .post(expressJwt({
    secret: config.jwtSecret,
  }), validate(paramValidation.createStudyMaterial, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}), studyMaterialCtrl.create);

router.route('/items/:studyMaterialId')

  /** GET /api/studyMaterials/:studyMaterialId - Get studyMaterial */
  .get(expressJwt({
    secret: config.jwtSecret,
  }), studyMaterialCtrl.get)

  /** PUT /api/studyMaterials/:studyMaterialId - Update studyMaterial */
  .put(expressJwt({
    secret: config.jwtSecret,
  }), validate(paramValidation.updateStudyMaterial, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}), studyMaterialCtrl.update)

  /** DELETE /api/studyMaterials/:studyMaterialId - Delete studyMaterial */
  .delete(expressJwt({
    secret: config.jwtSecret,
  }), studyMaterialCtrl.remove);

router.route('/contents')

  /** GET /api/studyMaterials - Get list of studyMaterials */
  .get(expressJwt({
    secret: config.jwtSecret,
  }), studyMaterialCtrl.listStudyMaterialContent
  )

  /** POST /api/studyMaterials - Create new studyMaterial */
  .post(expressJwt({
    secret: config.jwtSecret,
  }), validate(paramValidation.createStudyMaterialContent, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}), studyMaterialCtrl.createStudyMaterialContent);

router.route('/contents/:studyMaterialContentId')

  /** GET /api/studyMaterials/:studyMaterialId - Get studyMaterial */
  .get(expressJwt({
    secret: config.jwtSecret,
  }), studyMaterialCtrl.getStudyMaterialContent)

  /** PUT /api/studyMaterials/:studyMaterialId - Update studyMaterial */
  .put(expressJwt({
    secret: config.jwtSecret,
  }), validate(paramValidation.updateStudyMaterialContent, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}), studyMaterialCtrl.updateStudyMaterialContent)

  /** DELETE /api/studyMaterials/:studyMaterialId - Delete studyMaterial */
  .delete(expressJwt({
    secret: config.jwtSecret,
  }), studyMaterialCtrl.removeStudyMaterialContent);


router.route('/annotations/:studyMaterialContentAnnotationId')
  /** POST /api/study-materials/annotations */
  .post(expressJwt({
    secret: config.jwtSecret,
  }), validate(paramValidation.createStudyMaterialContentAnnotation, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}), studyMaterialCtrl.addStudyMaterialContentAnnotation);

router.route('/upload/:studyMaterialId')
  .post(
    expressJwt({ secret: config.jwtSecret }),
    upload.single('avatar'),
    studyMaterialCtrl.createStudyMaterialImageUpload
  )


/** Load user when API with studyMaterialId route parameter is hit */
router.param('studyMaterialId', studyMaterialCtrl.load);

export default router;
