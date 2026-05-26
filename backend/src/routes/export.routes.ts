import { Router } from 'express';
import exportController from '../controllers/export.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Secure all export actions with JWT checks
router.use(authMiddleware as any);

router.get('/csv', exportController.exportCSV as any);
router.get('/pdf', exportController.exportPDF as any);

export default router;
