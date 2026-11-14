// backend/src/routes/org.routes.ts
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireOrgMemberOrAdmin, requireSelfOrAdmin } from '../middleware/authorize.middleware';
import { OrgController } from '../controllers/org.controller';

const router = Router();
const orgController = new OrgController();

router.post('/', authMiddleware, orgController.createOrg)
router.post('/createMembership', authMiddleware, orgController.createMembership);

// Caller's own org and membership, from the token. 200 with null when none.
router.get('/me', authMiddleware, orgController.getMyOrg);
router.get('/me/membership', authMiddleware, orgController.getMyMembership);

router.get('/:orgId/getOrgById', authMiddleware, orgController.getOrgByOrgId)
router.get('/:orgId/getMembershipsbyOrgId', authMiddleware, requireOrgMemberOrAdmin('orgId'), orgController.getMembershipsByOrgId);

// Another user's records: platform ADMIN only (or the caller themselves).
router.get('/:userId/getOrgByUserId', authMiddleware, requireSelfOrAdmin('userId'), orgController.getOrgByUserId);
router.get('/:userId/getMembershipByUserId', authMiddleware, requireSelfOrAdmin('userId'), orgController.getMembershipByUserId);

export default router;
