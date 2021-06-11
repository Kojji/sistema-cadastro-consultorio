import express from 'express';
import { validate } from 'express-validation';
import paramValidation from '../../config/param-validation';
import classPlansCtrl from '../controllers/class-plans.controller';
import expressJwt from "express-jwt";
import config from "../../config/vars";
import multer from 'multer';

const storage = multer.memoryStorage();

const upload = multer({ storage: storage });

const router = express.Router(); // eslint-disable-line new-cap

router.route('/plans')

  /** GET /api/class-plans - Get list of class-plans */
  .get(expressJwt({
    secret: config.jwtSecret,
  }), classPlansCtrl.list
  )

  /** POST /api/class-plans - Create new classPlan */
  .post(expressJwt({
    secret: config.jwtSecret,
  }), validate(paramValidation.createclassPlan, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}), classPlansCtrl.create);

router.route('/duplicate/:classPlanId')
  .post(expressJwt({
    secret: config.jwtSecret,
  }), classPlansCtrl.duplicate)

router.route('/plans/:classPlanId')

  /** GET /api/class-plans/:classPlanId - Get classPlan */
  .get(expressJwt({
    secret: config.jwtSecret,
  }), classPlansCtrl.get)

  /** PUT /api/class-plans/:classPlanId - Update classPlan */
  .put(expressJwt({
    secret: config.jwtSecret,
  }), validate(paramValidation.updateclassPlan, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}), classPlansCtrl.update)

  /** DELETE /api/class-plans/:classPlanId - Delete classPlan */
  .delete(expressJwt({
    secret: config.jwtSecret,
  }), classPlansCtrl.remove);

router.route('/contents')
  /** GET /api/class-plans/contents - Get list of class-plans contents */
  .get(expressJwt({
    secret: config.jwtSecret,
  }), classPlansCtrl.listContents)

  /** POST /api/class-plans/contents - Create new classPlan Content */
  .post(expressJwt({
    secret: config.jwtSecret,
  }), validate(paramValidation.createclassPlanContent, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}), classPlansCtrl.createContent);

router.route('/contents/:classPlanContentId')
  /** GET /api/class-plans/contents/:classPlanContentId - Get classPlan Content */
  .get(expressJwt({
    secret: config.jwtSecret,
  }), classPlansCtrl.getContent)

  /** PUT /api/class-plans/contents/:classPlanContentId - Update classPlan Content */
  .put(expressJwt({
    secret: config.jwtSecret,
  }), validate(paramValidation.updateclassPlanContent, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}), classPlansCtrl.updateclassPlanContent)

  /** DELETE /api/class-plans/contents/:classPlanContentId - Delete classPlan Content */
  .delete(expressJwt({
    secret: config.jwtSecret,
  }), classPlansCtrl.removeContent);

router.route('/pages')
  /** GET /api/class-plans/contents - Get list of class-plans contents */
  .get(expressJwt({
    secret: config.jwtSecret,
  }), classPlansCtrl.listContentPages)

  /** POST /api/class-plans/contents - Create new classPlan Content */
  .post(expressJwt({
    secret: config.jwtSecret,
  }), validate(paramValidation.createclassPlanContentPage, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}), classPlansCtrl.createContentPage);

router.route('/pages/:classPlanContentPageId')
  /** GET /api/class-plans/contents/:classPlanContentId - Get classPlan Content */
  .get(expressJwt({
    secret: config.jwtSecret,
  }), classPlansCtrl.getContentPage)

  /** PUT /api/class-plans/contents/:classPlanContentId - Update classPlan Content */
  .put(expressJwt({
    secret: config.jwtSecret,
  }), validate(paramValidation.updateclassPlanContentPage, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}), classPlansCtrl.updateclassPlanContentPage)

  /** DELETE /api/class-plans/contents/:classPlanContentId - Delete classPlan Content */
  .delete(expressJwt({
    secret: config.jwtSecret,
  }), classPlansCtrl.removeContentPage);

router.route('/items')
  /** GET /api/class-plans/contents/pages/items - Get list of class-plans contents pages items */
  .get(expressJwt({
    secret: config.jwtSecret,
  }), classPlansCtrl.listContentPageItems)

  /** POST /api/class-plans/contents - Create new classPlan Content page item */
  .post(expressJwt({
    secret: config.jwtSecret,
  }), validate(paramValidation.createclassPlanContentPageItem, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}), classPlansCtrl.createContentPageItem);

router.route('/items/:classPlanContentPageItemId')
  /** GET /api/class-plans/contents/:classPlanContentId - Get classPlan Content page item */
  .get(expressJwt({
    secret: config.jwtSecret,
  }), classPlansCtrl.getContentPageItem)

  /** PUT /api/class-plans/contents/:classPlanContentId - Update classPlan Content page item */
  .put(expressJwt({
    secret: config.jwtSecret,
  }), validate(paramValidation.updateclassPlanContentPageItem, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}), classPlansCtrl.updateclassPlanContentPageItem)

  /** DELETE /api/class-plans/contents/:classPlanContentId - Delete classPlan Content page item */
  .delete(expressJwt({
    secret: config.jwtSecret,
  }), classPlansCtrl.removeContentPageItem);

  router.route('/upload/:classPlanId')
  .post(
    expressJwt({ secret: config.jwtSecret }),
    upload.single('avatar'),
    classPlansCtrl.createClassPlanImageUpload
  )

  router.route('/annotations/:classPlanContentPageItemAnnotationId')
  /** POST /api/entrance-exams/annotations */
  .post(expressJwt({
    secret: config.jwtSecret,
  }), validate(paramValidation.createClassPlanContentPageItemAnnotation, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}), classPlansCtrl.addClassPlanContentPageItemAnnotation);

/** Load user when API with classPlanId route parameter is hit */
router.param('classPlanId', classPlansCtrl.load);

export default router;
