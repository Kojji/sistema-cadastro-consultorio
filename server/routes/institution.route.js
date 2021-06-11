import express from 'express';
import { validate, Joi } from 'express-validation';
import paramValidation from '../../config/param-validation';
import institutionCtrl from '../controllers/institution.controller';
import expressJwt from "express-jwt";
import config from "../../config/vars";
import multer from 'multer';
import path from 'path';

const storage = multer.memoryStorage();

const upload = multer({ storage: storage });

const router = express.Router(); // eslint-disable-line new-cap

router.route('/')
  .get(expressJwt({
    secret: config.jwtSecret,
  }), institutionCtrl.list)

  .post(expressJwt({
    secret: config.jwtSecret,
  }), institutionCtrl.create);

router.route('/list-institutions')

  /** GET /api/list-institutions - Get list of institutions */
  .get(expressJwt({
    secret: config.jwtSecret,
  }), institutionCtrl.listInstitutions
  );

router.route('/change-institution')

  /** GET /api/change-institutions - Get list of institutions */
  .post(expressJwt({
    secret: config.jwtSecret,
  }), institutionCtrl.changeInstitution
  );

router.route('/search-institutions')

  /** GET /api/search-institutions - Get list of institutions in a place */
  .get(expressJwt({
    secret: config.jwtSecret,
  }), institutionCtrl.searchInstitutions
  );

router.route('/get-uf')

  /** GET /api/get-uf - Get list of states */
  .get(expressJwt({
    secret: config.jwtSecret,
  }), institutionCtrl.getUf
  );

router.route('/get-city/:uf')

  /** GET /api/get-city/:uf - Get list of cities */
  .get(expressJwt({
    secret: config.jwtSecret,
  }), institutionCtrl.getCity
  );

router.route('/get-cep/:cep')

  /** GET /api/get-cep/:cep - Get list of ceps */
  .get(expressJwt({
    secret: config.jwtSecret,
  }), institutionCtrl.getCEP
  );

router.route('/:institutionId')
/** PUT /api/institutions/:institutionId - Update institution */
.put(expressJwt({
  secret: config.jwtSecret,
}), validate(paramValidation.updateInstitution, {
  context: false,
  keyByField: true,
  statusCode: 400
}, {}), institutionCtrl.update);

router.route('/upload/:institutionId')
  .post(
    expressJwt({ secret: config.jwtSecret }),
    upload.single('file'),
    institutionCtrl.createInstitutionImageUpload
  )

/** Load institution when API with institutionId route parameter is hit */
router.param('institutionId', institutionCtrl.load);

export default router;
