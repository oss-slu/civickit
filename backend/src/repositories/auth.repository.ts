// backend/src/repositories/auth.repository.ts

import prisma from "../prisma";
import { User } from "@prisma/client";

export class AuthRepository {
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async createUser(data: {
    email: string;
    name: string;
    passwordHash: string;
  }): Promise<User> {
    return prisma.user.create({
      data,
    });
  }
}