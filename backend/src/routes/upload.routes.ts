// backend/src/routes/upload.routes.ts
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { UploadController } from '../controllers/upload.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const uploadController = new UploadController();

const uploadSignatureLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // limit each IP to 30 requests per windowMs for upload signatures
});

// Get a signed upload token for direct Cloudinary uploads
// This is used by mobile apps to securely upload images without exposing credentials
router.post('/signature', authMiddleware, uploadSignatureLimiter, uploadController.getUploadSignature);

export default router;
