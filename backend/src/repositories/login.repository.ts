// backend/src/repositories/login.repository.ts

import { eq } from 'drizzle-orm';
import db, { first } from '../db';
import { users } from '../db/schema';

export class LoginRepository {
  async findByEmail(email: string) {
    return first(
      await db
        .select({
          id: users.id,
          email: users.email,
          name: users.name,
          passwordHash: users.passwordHash,
          profileImage: users.profileImage,
          createdAt: users.createdAt,
        })
        .from(users)
        .where(eq(users.email, email))
        .limit(1),
    );
  }
}
