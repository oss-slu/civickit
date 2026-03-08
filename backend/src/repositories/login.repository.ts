// backend/src/repositories/login.repository.ts
import prisma from "../prisma";

export class LoginRepository {

  async findByEmail(email: string) {

    const user = await prisma.user.findUnique({
      where: { email }
    });

    return {
      id: user?.id, email: user?.email,
      name: user?.name, passwordHash: user?.passwordHash
    }
  }
}