import express from 'express';
import userRoutes from './user.route';
import authRoutes from './auth.route';
import fileRoutes from './file.route';

const router = express.Router(); // eslint-disable-line new-cap

// mount user routes at /users
router.use('/users', userRoutes);

// mount auth routes at /auth
router.use('/auth', authRoutes);

// mount files routes at /files
router.use('/files', fileRoutes);

export default router;
