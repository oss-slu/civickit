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

  async findById(id: string) {

    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (user != null) {
      return {
        id: user?.id, email: user?.email,
        name: user?.name, passwordHash: user?.passwordHash,
        profileImage: user?.profileImage, createdAt: user?.createdAt,
        role: user?.role
      }
    }

    return null
  }
}