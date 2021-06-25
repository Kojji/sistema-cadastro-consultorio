import express from 'express';
import userRoutes from './user.route';
import authRoutes from './auth.route';
import patientRoutes from './patient.route';
import utilsRoutes from './utils.route';

const router = express.Router(); // eslint-disable-line new-cap

// mount user routes at /users
router.use('/users', userRoutes);

// mount auth routes at /auth
router.use('/auth', authRoutes);

// mount auth routes at /patients
router.use('/patients', patientRoutes);

// mount auth routes at /utils
router.use('/utils', utilsRoutes);

export default router;
