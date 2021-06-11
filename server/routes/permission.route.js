import express from 'express';
import { validate } from 'express-validation';
import paramValidation from '../../config/param-validation';
import permissionCtrl from '../controllers/permission.controller';
import expressJwt from "express-jwt";
import config from "../../config/vars";

const router = express.Router(); // eslint-disable-line new-cap

router.route('/')
  /** GET /api/permissions - Get system permissions list*/
  .get(expressJwt({
    secret: config.jwtSecret,
  }), permissionCtrl.list)

router.route('/users')
  /** GET /api/permissions/users - Get system "redatores" list */
  .get(expressJwt({
    secret: config.jwtSecret,
  }), permissionCtrl.listUsers)

router.route('/users/:userId')
  /** GET /api/permissions/users/:userId - Get user system permissions */
  .get(expressJwt({
    secret: config.jwtSecret,
  }), permissionCtrl.getPermissionByUser)

router.route('/:userId/include/:permissionId')
  /** POST /api/permissions/:userId/include/:permissionId - include permission to user */
  .post(expressJwt({
    secret: config.jwtSecret,
  }), permissionCtrl.includeToUser)

router.route('/:userId/remove/:permissionId')
  /** DELETE /api/permissions/:userId/remove/:permissionId - remove permission to user */
  .delete(expressJwt({
    secret: config.jwtSecret,
  }), permissionCtrl.removeFromUser)

export default router;
