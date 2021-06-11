import express from 'express';
import userRoutes from './user.route';
import authRoutes from './auth.route';
import institutionsRoutes from './institution.route';
import levelsRoutes from './level.route';
import gradesRoutes from './grade.route';
import subjectsRoutes from './subject.route';
import rolesRoutes from './role.route';
import areasRoutes from './area.route';
import coursesRoutes from './course.route';
import registerRoutes from './register.route';
import fileRoutes from './file.route';
import classroomsRoutes from './classroom.route';
import feedRoutes from './feed.route';
import favoriteRoutes from './favorite.route';
import classroomStudentsRoutes from './classroom-student.route';
import questionActivityDatabaseRoutes from './question-activity-database.route';
import indicatorRoutes from './indicator.route';
import reportRoutes from './report.route';
import chatRoutes from './chat.route';
import tagRoutes from './tag.route';
import flagRoutes from './flag.route';
import permissionRoutes from './permission.route';
import classPlansRoutes from './class-plan.route';
import supportsRoutes from './support.route';
import workshopRoutes from './workshop.route';
import entranceExamRoutes from './entrance-exam.route';
import studyMaterialRoutes from './study-material.route';
import studyGroupRoutes from './study-group.route';
import db from '../models';

const router = express.Router(); // eslint-disable-line new-cap
// const { Token_Control, sequelize } = db;

// router.use(async function (req, res, next) {
//   console.log(req.header('Authorization'))
//   if(!!req.header('Authorization')) {
//     let token = req.header('Authorization').replace('Bearer ', '')
//     const foundToken = await Token_Control.findOne({
//       where: {token},
//       attributes: ['id', 'UserId']
//     })
//     if(!foundToken) {
//       return res.json({
//         message: "token de acesso precisa ser renovado",
//         success: false,
//         redirect: '/login'
//       });
//     } else {
//       next()
//     }
//   } else {
//     next();
//   }
// });

// mount user routes at /users
router.use('/users', userRoutes);

// mount auth routes at /auth
router.use('/auth', authRoutes);

// mount institutions routes at /institutions
router.use('/institutions', institutionsRoutes);

// mount levels routes at /levels
router.use('/levels', levelsRoutes);

// mount grades routes at /grades
router.use('/grades', gradesRoutes);

// mount subjects routes at /subjects
router.use('/subjects', subjectsRoutes);

// mount courses routes at /courses
router.use('/courses', coursesRoutes);

// mount roles routes at /roles
router.use('/roles', rolesRoutes);

// mount areas routes at /areas
router.use('/areas', areasRoutes);

// mount institutions routes at /institutions
router.use('/institutions', institutionsRoutes);

// mount register routes at /register
router.use('/register', registerRoutes);

// mount files routes at /files
router.use('/files', fileRoutes);

// mount classrooms routes at /classrooms
router.use('/classrooms', classroomsRoutes);

// mount feeds routes at /feeds
router.use('/feeds', feedRoutes);

// mount favorites routes at /favorites
router.use('/favorites', favoriteRoutes);

// mount classroom-students routes at /classroom-students
router.use('/classroom-students', classroomStudentsRoutes);

// mount database routes at /database
router.use('/database', questionActivityDatabaseRoutes);

// mount indicators routes at /indicators
router.use('/indicators', indicatorRoutes);

// mount reports routes at /reports
router.use('/reports', reportRoutes);

// mount reports routes at /chats
router.use('/chats', chatRoutes);

// mount reports routes at /tags
router.use('/tags', tagRoutes);

// mount reports routes at /flags
router.use('/flags', flagRoutes);

// mount reports routes at /permissions
router.use('/permissions', permissionRoutes);

// mount reports routes at /class-plans
router.use('/class-plans', classPlansRoutes);

// mount reports routes at /supports
router.use('/supports', supportsRoutes);

// mount reports routes at /workshops
router.use('/workshops', workshopRoutes);

// mount reports routes at /entrance-exams
router.use('/entrance-exams', entranceExamRoutes);

// mount reports routes at /study-materials
router.use('/study-materials', studyMaterialRoutes);

// mount reports routes at /study-groups
router.use('/study-groups', studyGroupRoutes);

export default router;
