import { Router } from 'express';
import analyticsController from '../controllers/analytics.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Secure analytics endpoint with JWT check
router.use(authMiddleware as any);

router.get('/', analyticsController.getDashboardAnalytics);

export default router;
