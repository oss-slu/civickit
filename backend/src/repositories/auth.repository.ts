// backend/src/repositories/auth.repository.ts

import { eq } from 'drizzle-orm';
import db, { first } from '../db';
import { User, users } from '../db/schema';

export class AuthRepository {
  async findByEmail(email: string): Promise<User | null> {
    return first(
      await db.select().from(users).where(eq(users.email, email)).limit(1),
    );
  }

  async createUser(data: {
    email: string;
    name: string;
    passwordHash: string;
  }): Promise<User> {
    const [user] = await db.insert(users).values(data).returning();

    return user;
  }

  async findById(id: string) {
    return first(
      await db
        .select({
          id: users.id,
          email: users.email,
          name: users.name,
          profilePhotoId: users.profilePhotoId,
          createdAt: users.createdAt,
          role: users.role,
        })
        .from(users)
        .where(eq(users.id, id))
        .limit(1),
    );
  }
}
