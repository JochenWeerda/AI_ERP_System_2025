import { Router } from 'express';
import userRoutes from './user.routes';
import authRoutes from './auth.routes';
import { authenticate } from '../middleware/auth';

const router = Router();

// Öffentliche Routen
router.use('/auth', authRoutes);

// Geschützte Routen
router.use('/users', authenticate, userRoutes);

// API-Versionierung
const apiRouter = Router();
apiRouter.use('/v1', router);

export default apiRouter; 