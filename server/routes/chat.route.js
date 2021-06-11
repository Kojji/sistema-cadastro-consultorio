import express from 'express';
import { validate } from 'express-validation';
import paramValidation from '../../config/param-validation';
import chatCtrl from '../controllers/chat.controller';
import expressJwt from "express-jwt";
import config from "../../config/vars";

const router = express.Router(); // eslint-disable-line new-cap

router.route('/')
  /** GET /api/chats - list chats */
  .get(expressJwt({
    secret: config.jwtSecret,
  }), chatCtrl.listChats);

router.route('/users')
  /** GET /api/chats - list users */
  .get(expressJwt({
    secret: config.jwtSecret,
  }), chatCtrl.listUsers);

router.route('/messages/:userId')
  /** GET /api/chats - list users */
  .get(expressJwt({
    secret: config.jwtSecret,
  }), chatCtrl.listMessages);

export default router;