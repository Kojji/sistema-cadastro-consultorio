import express from 'express';
import userRoutes from './user.route';
import authRoutes from './auth.route';
import patientRoutes from './patient.route';
import utilsRoutes from './utils.route';
import appointmentsRoutes from './appointments.route';

const router = express.Router(); // eslint-disable-line new-cap

// mount user routes at /users
router.use('/users', userRoutes);

// mount auth routes at /auth
router.use('/auth', authRoutes);

// mount patients routes at /patients
router.use('/patients', patientRoutes);

// mount utils routes at /utils
router.use('/utils', utilsRoutes);

// mount appointments routes at /appointments
router.use('/appointments', appointmentsRoutes);

export default router;
