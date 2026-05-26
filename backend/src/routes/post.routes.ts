import { Router } from 'express';
import postController from '../controllers/post.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Secure all post endpoints with JWT check
router.use(authMiddleware as any);

router.get('/', postController.getPosts);
router.get('/:id', postController.getPostById);
router.post('/:id/translate', postController.translatePost);
router.get('/cluster/:clusterId', postController.getClusterThread);

export default router;
