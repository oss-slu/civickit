// backend/src/controllers/login.controller.ts
import { Request, Response, NextFunction } from 'express';
import { LoginService } from '../services/login.service';
import { LoginRepository } from '../repositories/login.repository';

const loginRepository = new LoginRepository();
const loginService = new LoginService(loginRepository);

export class LoginController {
  async getUser(req: Request, res: Response, next: NextFunction) {
    try {
        const user = await loginService.getUser(req.body.email, req.body.password);
        res.json(user);
    } catch (error) {
        next(error);
    }
  }
}