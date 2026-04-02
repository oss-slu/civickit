// backend/src/controllers/auth.controller.ts

import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";
import { AuthRepository } from "../repositories/auth.repository";
import { LoginService } from "../services/login.service";
import { LoginRepository } from "../repositories/login.repository";
import { CreateAuthDTO } from "@civickit/shared";

const authRepository = new AuthRepository();
const authService = new AuthService(authRepository);
const loginRepository = new LoginRepository();
const loginService = new LoginService(loginRepository);

export class AuthController {
  async register(req: Request<{}, {}, CreateAuthDTO>, res: Response, next: NextFunction) {
    try {
      const { email, password, name } = req.body;
      await authService.registerUser({ email, password, name });
      const loginResponse = await loginService.login({ email, password }); //lets the user login immediately after registering, instead of having to call the login endpoint separately
      return res.status(201).json(loginResponse);
    } catch (error: any) {
      next(error);
    }
  }
}