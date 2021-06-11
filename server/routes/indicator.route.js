import express from 'express';
import { validate, Joi } from 'express-validation';
import paramValidation from '../../config/param-validation';
import indicatorCtrl from '../controllers/indicator.controller';
import expressJwt from "express-jwt";
import config from "../../config/vars";

const router = express.Router(); // eslint-disable-line new-cap

router.route('/')
  .get(expressJwt({
    secret: config.jwtSecret,
  }), indicatorCtrl.list);

export default router;
