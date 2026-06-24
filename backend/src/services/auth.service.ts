// backend/src/services/auth.service.ts

import bcrypt from "bcryptjs";
import { AuthRepository } from "../repositories/auth.repository";
import { CreateAuthDTO } from "@civickit/shared";
import { SafeUser } from '../types/auth.types'
import { z } from 'zod';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { AppError } from "../utils/errors";

export class AuthService {
  constructor(private authRepository: AuthRepository) { }

  async registerUser(data: CreateAuthDTO): Promise<SafeUser> {
    const { email, password, name } = data;

    // Validate email format
    const emailSchema = z.email();
    if (!emailSchema.safeParse(email).success) {
      throw new AppError("Invalid email format", 400);
    }

    // Validate password length
    if (password.length < 8) {
      throw new AppError("Password too short (min 8 characters)", 400);
    }

    // Check for existing user
    const existingUser = await this.authRepository.findByEmail(email);
    if (existingUser) {
      throw new AppError("Email already exists", 409);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in database
    const newUser = await this.authRepository.createUser({
      email,
      name,
      passwordHash: hashedPassword,
    });

    // Remove passwordHash before returning
    const { passwordHash: _, ...safeUser } = newUser;
    return safeUser;
  }

  async getUserByToken(token: string) {
    const secret = String(process.env.JWT_SECRET)
    if (secret == undefined) {
      throw new AppError("JWT secret not configured", 500);
    }
    try {
      const tokenResponse = jwt.verify(token, secret) as JwtPayload
      const id = tokenResponse.userId

      const user = await this.authRepository.findById(id);
      if (!user) {
        throw new AppError('User not found', 404);
      }
      return user
    } catch (error) {
      throw new AppError("Invalid token", 401)
    }

  }
}