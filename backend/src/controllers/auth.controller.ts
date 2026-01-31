// backend/src/controllers/auth.controller.ts

import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";
import { AuthRepository } from "../repositories/auth.repository";
import { CreateAuthDTO } from "../types/auth.types";

const authRepository = new AuthRepository();
const authService = new AuthService(authRepository);

export class AuthController {
  async register(req: Request<{}, {}, CreateAuthDTO>, res: Response, next: NextFunction) {
    try {
      const { email, password, name } = req.body;
      const user = await authService.registerUser({ email, password, name });
      return res.status(201).json(user);
    } catch (error: any) {
      next(error);
    }
  }
}