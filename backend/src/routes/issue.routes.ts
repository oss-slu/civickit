// backend/src/routes/issue.routes.ts
import { Router } from 'express';
import { IssueController } from '../controllers/issue.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const issueController = new IssueController();

router.post('/', issueController.createIssue);
router.get('/nearby', issueController.getNearbyIssues);
router.get('/:id', issueController.getIssueById);

export default router;