// backend/src/services/auth.service.ts

import bcrypt from "bcryptjs";
import { AuthRepository } from "../repositories/auth.repository";
import { CreateAuthDTO, SafeUser } from "../types/auth.types";

export class AuthService {
  constructor(private authRepository: AuthRepository) {}

  async registerUser(data: CreateAuthDTO): Promise<SafeUser> {
    const { email, password, name } = data;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw { status: 400, message: "Invalid email format" };
    }

    // Validate password length
    if (password.length < 8) {
      throw { status: 400, message: "Password too short (min 8 characters)" };
    }

    // Check for existing user
    const existingUser = await this.authRepository.findByEmail(email);
    if (existingUser) {
      throw { status: 409, message: "Email already exists" };
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
}