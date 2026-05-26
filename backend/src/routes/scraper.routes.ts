import { Router } from 'express';
import scraperController from '../controllers/scraper.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Secure all scraper administration endpoints with JWT checks
router.use(authMiddleware as any);

router.post('/trigger', scraperController.triggerScraping as any);
router.get('/status', scraperController.getScraperStatus as any);

export default router;
