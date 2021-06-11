import express from 'express';
import { validate, Joi } from 'express-validation';
import paramValidation from '../../config/param-validation';
import reportCtrl from '../controllers/report.controller';
import expressJwt from "express-jwt";
import config from "../../config/vars";

const router = express.Router(); // eslint-disable-line new-cap

router.route('/')
  .get(expressJwt({
    secret: config.jwtSecret,
  }), reportCtrl.list)

  .post(expressJwt({
    secret: config.jwtSecret,
  }), reportCtrl.create);

router.route('/:reportId')
  .get(expressJwt({
    secret: config.jwtSecret,
  }), reportCtrl.get)

  .delete(expressJwt({
    secret: config.jwtSecret,
  }), reportCtrl.remove);

export default router;
