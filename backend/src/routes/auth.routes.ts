// backend/src/routes/auth.routes.ts

import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";

const router = Router();
const authController = new AuthController();

// Rate Limiter
import RateLimit from 'express-rate-limit';
const limiter = RateLimit({
  windowMs: 15 * 60 * 1000, //15 minutes
  max: 100, //max 100 requests per window
})
router.use(limiter)

router.post("/register", authController.register.bind(authController));

export default router;