// backend/src/controllers/login.controller.ts
import { Request, Response, NextFunction } from 'express';
import { LoginService } from '../services/login.service';
import { LoginRepository } from '../repositories/login.repository';
import { LoginDTO } from '@civickit/shared';
import { ImageRepository } from '../repositories/image.repository';

const loginRepository = new LoginRepository();
const loginService = new LoginService(loginRepository, new ImageRepository);

export class LoginController {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const loginDTO: LoginDTO = {
        email: req.body.email.toLowerCase(),
        password: req.body.password
      }

      const user = await loginService.login(loginDTO);
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }
}