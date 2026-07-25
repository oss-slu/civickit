// backend/src/__tests__/integration/auth.integration.test.ts
//
// better-auth is mounted at /api/better-auth/auth/* and had no coverage at all,
// which made swapping its database adapter the least verifiable change in the
// migration. These exercise the adapter against a real database: they would
// fail on a schema mismatch, a wrong model name, or a column better-auth
// expects and cannot find.

import { describe, it, expect } from 'vitest';
import { eq } from 'drizzle-orm';
import { auth } from '../../auth';
import db from '../../db';
import { accounts, sessions, users } from '../../db/schema';

const credentials = {
  email: 'ada@example.com',
  password: 'correct-horse-battery-staple',
  name: 'Ada Lovelace',
};

const signUp = () => auth.api.signUpEmail({ body: { ...credentials } });

describe('better-auth with the Drizzle adapter', () => {
  describe('sign up', () => {
    it('returns the new user', async () => {
      const result = await signUp();

      expect(result.user.email).toBe('ada@example.com');
      expect(result.user.name).toBe('Ada Lovelace');
      expect(result.user.id).toEqual(expect.any(String));
    });

    it('writes the user row, with our own columns defaulted', async () => {
      const result = await signUp();

      const [user] = await db.select().from(users).where(eq(users.id, result.user.id));

      expect(user.email).toBe('ada@example.com');
      expect(user.emailVerified).toBe(false);
      // Columns better-auth knows nothing about still have to be satisfiable.
      expect(user.role).toBe('REPORTER');
      expect(user.passwordHash).toBeNull();
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });

    it('writes a credential account holding the password hash', async () => {
      const result = await signUp();

      const [account] = await db
        .select()
        .from(accounts)
        .where(eq(accounts.userId, result.user.id));

      expect(account.providerId).toBe('credential');
      expect(account.password).toEqual(expect.any(String));
      expect(account.password).not.toBe(credentials.password);
    });

    it('rejects a second sign up with the same email', async () => {
      await signUp();

      await expect(signUp()).rejects.toThrow();
    });
  });

  describe('sign in', () => {
    it('accepts the right password and opens a session', async () => {
      const created = await signUp();

      const result = await auth.api.signInEmail({
        body: { email: credentials.email, password: credentials.password },
      });

      expect(result.user.id).toBe(created.user.id);

      const found = await db
        .select()
        .from(sessions)
        .where(eq(sessions.userId, created.user.id));

      expect(found.length).toBeGreaterThan(0);
      expect(found[0].token).toEqual(expect.any(String));
      expect(found[0].expiresAt).toBeInstanceOf(Date);
    });

    it('rejects the wrong password', async () => {
      await signUp();

      await expect(
        auth.api.signInEmail({
          body: { email: credentials.email, password: 'not-the-password' },
        }),
      ).rejects.toThrow();
    });

    it('rejects an unknown email', async () => {
      await expect(
        auth.api.signInEmail({
          body: { email: 'nobody@example.com', password: credentials.password },
        }),
      ).rejects.toThrow();
    });
  });
});
