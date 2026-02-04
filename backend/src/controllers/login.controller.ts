// backend/src/controllers/login.controller.ts
import { Request, Response, NextFunction } from 'express';
import { LoginService } from '../services/login.service';
import { LoginRepository } from '../repositories/login.repository';
import { LoginDTO } from '../types/login.types';
import { authMiddleware } from '../middleware/auth.middleware';

const loginRepository = new LoginRepository();
const loginService = new LoginService(loginRepository);

export class LoginController {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
        const loginDTO: LoginDTO = {
          email: req.body.email,
          password: req.body.password
        }
        
        const user = await loginService.login(loginDTO);
        res.json(user);
    } catch (error) {
        next(error);
    }
  }
}