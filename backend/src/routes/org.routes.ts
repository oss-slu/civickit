// backend/src/routes/org.routes.ts
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/authorize.middleware';
import { OrgController } from '../controllers/org.controller';

const router = Router();
const orgController = new OrgController();

router.post('/', authMiddleware, orgController.createOrg)
router.post('/createMembership', authMiddleware, orgController.createMembership);

router.get('/:orgId/getOrgById', authMiddleware, orgController.getOrgByOrgId)
router.get('/:orgId/getMembershipsbyOrgId', authMiddleware, orgController.getMembershipsByOrgId);

router.get('/:userId/getOrgByUserId', authMiddleware, orgController.getOrgByUserId);
router.get('/:userId/getMembershipByUserId', authMiddleware, orgController.getMembershipByUserId);




export default router;
