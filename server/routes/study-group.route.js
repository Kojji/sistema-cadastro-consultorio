import express from 'express';
import { validate } from 'express-validation';
import paramValidation from '../../config/param-validation';
import studyGroupCtrl from '../controllers/study-group.controller';
import expressJwt from "express-jwt";
import config from "../../config/vars";

const router = express.Router(); // eslint-disable-line new-cap

router.route('/')
  /** GET /api/study-groups - get user's groups */
  .get(expressJwt({
    secret: config.jwtSecret,
  }), studyGroupCtrl.listGroups)
  /** POST /api/study-groups - Create new group */
  .post(expressJwt({
    secret: config.jwtSecret,
  }), validate(paramValidation.createStudyGroup, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}), studyGroupCtrl.createGroup);
  

router.route('/:groupId')
  /** PUT /api/study-groups/:groupId - edit group info */
  .put(expressJwt({
    secret: config.jwtSecret,
  }), validate(paramValidation.editStudyGroup, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}), studyGroupCtrl.editGroupInfo)
  /** GET /api/study-groups/:groupId - get group data */
  .get(expressJwt({
    secret: config.jwtSecret,
  }), studyGroupCtrl.getGroup);

router.route('/:groupId/remove')
  /** DELETE /api/study-groups/:groupId/remove - Remove group from user's group listing */
  .delete(expressJwt({
    secret: config.jwtSecret,
  }), studyGroupCtrl.removeGroupFromList);

router.route('/:groupId/remove-user/:userId')
  /** DELETE /api/study-groups/:groupId/remove-user/:userId - Remove user from group */
  .delete(expressJwt({
    secret: config.jwtSecret,
  }), studyGroupCtrl.removePersonFromGroup);

router.route('/:groupId/admin')
  /** POST /api/study-groups/:groupId/admin - Add new group admin */
  .post(expressJwt({
    secret: config.jwtSecret,
  }), validate(paramValidation.addAdminStudyGroup, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}), studyGroupCtrl.setAdminToGroup);

router.route('/:groupId/exit')
  /** GET /api/study-groups/:groupId/exit - User exit group */
  .get(expressJwt({
    secret: config.jwtSecret,
  }), studyGroupCtrl.exitGroup);

router.route('/:groupId/users')
  /** GET /api/study-groups/:groupId/users - group's users */
  .get(expressJwt({
    secret: config.jwtSecret,
  }), studyGroupCtrl.getGroupUsers);

router.route('/code/:groupCode')
  /** GET /api/study-groups/code/:groupCode - Add user in group */
  .get(expressJwt({
    secret: config.jwtSecret,
  }), studyGroupCtrl.insertInGroup);

router.route('/:groupId/code')
  /** GET /api/study-groups/:groupId/code - get group insertion code */
  .get(expressJwt({
    secret: config.jwtSecret,
  }), studyGroupCtrl.getGroupCode)
  /** POST /api/study-groups/:groupId/code - change group insertion code */
  .post(expressJwt({
    secret: config.jwtSecret,
  }), studyGroupCtrl.changeGroupCode);

router.route('/:groupId/share')
  /** GET /api/study-groups/:groupId/share - list content shared*/
  .get(expressJwt({
    secret: config.jwtSecret,
  }), studyGroupCtrl.listShares)
  /** POST /api/study-groups/:groupId/share - share study group content */
  .post(expressJwt({
    secret: config.jwtSecret,
  }), validate(paramValidation.shareStudyGroupContent, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}), studyGroupCtrl.shareFiles);

router.route('/:groupId/message')
  /** GET /api/study-groups/:groupId/message - list study group messages */
  .get(expressJwt({
    secret: config.jwtSecret,
  }), studyGroupCtrl.listMessages)
  /** POST /api/study-groups/:groupId/message - create study group message */
  .post(expressJwt({
    secret: config.jwtSecret,
  }), validate(paramValidation.sendStudyGroupMessage, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}), studyGroupCtrl.sendMessage);

router.route('/:groupId/notes')
  /** PUT /api/study-groups/:groupId/notes - update study group notes */
  .put(expressJwt({
    secret: config.jwtSecret,
  }), validate(paramValidation.updateStudyGroupNotes, {
    context: false,
    keyByField: true,
    statusCode: 400
  }, {}), studyGroupCtrl.saveNote);


export default router;