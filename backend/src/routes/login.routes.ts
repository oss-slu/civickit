// backend/src/routes/login.routes.ts
import { Router } from 'express';
import { LoginController } from '../controllers/login.controller';

const router = Router();
const loginController = new LoginController();

// Rate Limiter
var RateLimit = require('express-rate-limit')
var limiter = RateLimit({
  windowMs: 15 * 60 * 1000, //15 minutes
  max: 100, //max 100 requests per window
})
router.use(limiter)

router.post('/', loginController.login);
export default router;