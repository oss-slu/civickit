// backend/src/controllers/auth.controller.ts

import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";
import { AuthRepository } from "../repositories/auth.repository";
import { LoginService } from "../services/login.service";
import { LoginRepository } from "../repositories/login.repository";
import { CreateAuthDTO } from "@civickit/shared";
import { AppError } from "../utils/errors";
import { PhotoRepository } from "../repositories/photo.repository";

const authRepository = new AuthRepository();
const photoRepository = new PhotoRepository()
const authService = new AuthService(authRepository, photoRepository);
const loginRepository = new LoginRepository();
const loginService = new LoginService(loginRepository, photoRepository);

export class AuthController {
  async register(req: Request<{}, {}, CreateAuthDTO>, res: Response, next: NextFunction) {
    try {
      const { password, name } = req.body;
      const email = req.body.email.toLowerCase()
      await authService.registerUser({ email, password, name });
      const loginResponse = await loginService.login({ email, password }); //lets the user login immediately after registering, instead of having to call the login endpoint separately
      return res.status(201).json(loginResponse);
    } catch (error: any) {
      next(error);
    }
  }

  async getCurrentUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.getUserById(String(req.userId));
      res.json(user);
    } catch (error: any) {
      next(error);
    }
  }

  async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.getUserById(String(req.params.userId));
      res.json(user);
    } catch (error: any) {
      next(error);
    }
  }
}
