// backend/src/routes/issue.routes.ts
import { Router } from 'express';
import { IssueController } from '../controllers/issue.controller';
import { UpvoteController } from '../controllers/upvote.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const issueController = new IssueController();
const upvoteController = new UpvoteController();

router.post('/', authMiddleware, issueController.createIssue);
router.get('/nearby', issueController.getNearbyIssues);
router.get('/:id', issueController.getIssueById);

// upvote functionality
router.post(
  '/:issueId/upvote',
  authMiddleware,
  (req, res, next) => upvoteController.upvote(req, res, next)
);

router.delete(
  '/:issueId/upvote',
  authMiddleware,
  (req, res, next) => upvoteController.removeUpvote(req, res, next)
);

export default router;