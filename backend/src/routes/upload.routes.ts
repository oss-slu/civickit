// backend/src/routes/upload.routes.ts
import { Router } from 'express';
import { UploadController } from '../controllers/upload.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const uploadController = new UploadController();

// Get a signed upload token for direct Cloudinary uploads
// This is used by mobile apps to securely upload images without exposing credentials
router.post('/signature', authMiddleware, uploadController.getUploadSignature);

export default router;
