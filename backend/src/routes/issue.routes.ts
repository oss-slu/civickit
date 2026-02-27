// backend/src/routes/issue.routes.ts
import { Router } from 'express';
import { IssueController } from '../controllers/issue.controller';
import { UpvoteController } from '../controllers/upvote.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { uploadMiddleware } from '../middleware/upload.middleware';

const router = Router();
const issueController = new IssueController();
const upvoteController = new UpvoteController();

router.post('/', authMiddleware, uploadMiddleware.array('images', 5), issueController.createIssue);
router.get('/nearby', issueController.getNearbyIssues);
router.get('/:id', issueController.getIssueById);

// upvote functionality
router.post('/:issueId/upvote', authMiddleware, upvoteController.upvote); // create upvote
router.get('/:issueId/upvote', authMiddleware, upvoteController.getUpvotes) // get upvote count {read}
router.delete('/:issueId/upvote', authMiddleware, upvoteController.removeUpvote); // remove upvote {delete}

export default router;