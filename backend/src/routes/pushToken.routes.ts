// backend/src/routes/pushToken.routes.ts
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { PushTokenController } from '../controllers/pushToken.controller';

const router = Router();
const pushTokenController = new PushTokenController()

router.post('/', authMiddleware, pushTokenController.registerToken);
router.delete('/:token', authMiddleware, pushTokenController.removeToken)
export default router;