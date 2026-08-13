// backend/src/routes/image.routes.ts
import { Router } from 'express';
import { IssueController } from '../controllers/issue.controller';
import { UpvoteController } from '../controllers/upvote.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/authorize.middleware';
import { TimelineController } from '../controllers/timeline.controller';
import { validateBody } from '../middleware/validate';
import { createIssueSchema } from '../schemas/issue.schema';
import { ImageController } from '../controllers/image.controller';

const router = Router();
const imageController = new ImageController();

router.post('/', authMiddleware, imageController.createImage);
router.get('/:id', imageController.getImageById);

export default router;
