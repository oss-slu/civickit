// backend/src/repositories/__tests__/integration/auth.repository.integration.test.ts

import { describe, it, expect } from 'vitest';
import { AuthRepository } from '../../auth.repository';

const repository = new AuthRepository();

function newUser(overrides: Partial<{ email: string; name: string; passwordHash: string }> = {}) {
  return {
    email: 'ada@example.com',
    name: 'Ada Lovelace',
    passwordHash: 'not-a-real-hash',
    ...overrides,
  };
}

describe('AuthRepository', () => {
  describe('createUser', () => {
    it('persists a user and returns the generated id and timestamps', async () => {
      const created = await repository.createUser(newUser());

      expect(created.id).toEqual(expect.any(String));
      expect(created.email).toBe('ada@example.com');
      expect(created.name).toBe('Ada Lovelace');
      expect(created.createdAt).toBeInstanceOf(Date);
      expect(created.updatedAt).toBeInstanceOf(Date);
    });

    it('defaults role to REPORTER', async () => {
      const created = await repository.createUser(newUser());

      expect(created.role).toBe('REPORTER');
    });

    it('rejects a duplicate email', async () => {
      await repository.createUser(newUser());

      await expect(repository.createUser(newUser())).rejects.toThrow();
    });
  });

  describe('findByEmail', () => {
    it('returns the full row including passwordHash', async () => {
      await repository.createUser(newUser());

      const found = await repository.findByEmail('ada@example.com');

      expect(found).not.toBeNull();
      expect(found!.email).toBe('ada@example.com');
      expect(found!.passwordHash).toBe('not-a-real-hash');
    });

    it('returns null when no user has that email', async () => {
      expect(await repository.findByEmail('nobody@example.com')).toBeNull();
    });

    it('does not match a different casing', async () => {
      await repository.createUser(newUser());

      expect(await repository.findByEmail('ADA@example.com')).toBeNull();
    });
  });

  describe('findById', () => {
    it('returns the safe projection without passwordHash', async () => {
      const created = await repository.createUser(newUser());

      const found = await repository.findById(created.id);

      expect(found).toEqual({
        id: created.id,
        email: 'ada@example.com',
        name: 'Ada Lovelace',
        profileImageId: null,
        createdAt: expect.any(Date),
        role: 'REPORTER',
      });
      expect(found).not.toHaveProperty('passwordHash');
    });

    it('returns null for an unknown id', async () => {
      expect(await repository.findById('does-not-exist')).toBeNull();
    });
  });
});
