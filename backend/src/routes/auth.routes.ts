// backend/src/routes/auth.routes.ts

import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";

const router = Router();
const authController = new AuthController();

router.post("/register", authController.register.bind(authController));

export default router;