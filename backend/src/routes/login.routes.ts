// backend/src/routes/login.routes.ts
import { Router } from 'express';
import { LoginController } from '../controllers/login.controller';

const router = Router();
const loginController = new LoginController();

router.post('/', loginController.login);
export default router;