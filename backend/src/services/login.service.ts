// backend/src/services/login.service.ts

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { LoginRepository } from '../repositories/login.repository';
import { LoginDTO, LoginResponse } from "@civickit/shared";
import "dotenv/config";
import { AppError } from "../utils/errors";

export class LoginService {
  constructor(private loginRepository: LoginRepository) { }

  async login(credentials: LoginDTO): Promise<LoginResponse | AppError> {
    const user = await this.loginRepository.findByEmail(credentials.email);

    if (user == null) {
      //TODO: fix to throw AppError
      throw new AppError('Email not found', 401);
    }

    //compare user entered pw with pw hash from repo
    const match = await bcrypt.compare(credentials.password, String(user.passwordHash))
    if (!match) {
      throw new AppError('Password and email do not match', 401);
    }

    //generate token with user id
    const key = String(process.env.JWT_SECRET)
    const token = jwt.sign({ userId: user.id }, key, { expiresIn: '7d' })

    const loginResponse: LoginResponse = {
      token: token,
      user: {
        id: String(user.id),
        name: String(user.name),
        email: String(user.email),
        createdAt: String(user.createdAt),
        profileImage: String(user.profileImage)
      }
    };

    return loginResponse;
  }
}

