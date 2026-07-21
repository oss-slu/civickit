// backend/src/routes/issue.routes.ts
import { Router } from 'express';
import { IssueController } from '../controllers/issue.controller';
import { UpvoteController } from '../controllers/upvote.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/authorize.middleware';
import { TimelineController } from '../controllers/timeline.controller';

const router = Router();
const issueController = new IssueController();
const upvoteController = new UpvoteController();
const timelineController = new TimelineController();

router.post('/', authMiddleware, issueController.createIssue);
router.get('/nearby', issueController.getNearbyIssues);
router.get('/user', issueController.getIssuesByUser);
router.get('/userUpvotes', issueController.getIssuesByUserUpvotes);
router.get('/:id', issueController.getIssueById);

// upvote functionality
router.post('/:issueId/upvote', authMiddleware, upvoteController.upvote); // create upvote
router.get('/:issueId/upvote', authMiddleware, upvoteController.getUpvotes) // get upvote count {read}
router.delete('/:issueId/upvote', authMiddleware, upvoteController.removeUpvote); // remove upvote {delete}

// update issue status
router.patch('/:issueId/status', authMiddleware, requirePermission('update:issue_status'), issueController.updateStatus);

// timeline functionality
// postUpdate changes the issue status, so it needs the same gate as PATCH /status.
router.post('/:issueId/update', authMiddleware, requirePermission('update:issue_status'), timelineController.postUpdate);
router.get('/:issueId/updates', authMiddleware, timelineController.getIssueUpdates)
router.get('/:userId/userUpdates', authMiddleware, timelineController.getUserUpdates)


export default router;
