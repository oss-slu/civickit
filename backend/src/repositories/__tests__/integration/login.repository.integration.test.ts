// backend/src/repositories/__tests__/integration/login.repository.integration.test.ts

import { describe, it, expect } from 'vitest';
import { LoginRepository } from '../../login.repository';
import { makeUser } from '../../../__tests__/integration/factories';

const repository = new LoginRepository();

describe('LoginRepository', () => {
  describe('findByEmail', () => {
    it('returns the fields the login flow needs, including passwordHash', async () => {
      const user = await makeUser({ email: 'ada@example.com', name: 'Ada Lovelace' });

      const found = await repository.findByEmail('ada@example.com');

      expect(found).toEqual({
        id: user.id,
        email: 'ada@example.com',
        name: 'Ada Lovelace',
        passwordHash: 'not-a-real-hash',
        profileImage: null,
        createdAt: expect.any(Date),
        role: "REPORTER"
      });
    });

    it('narrows to that projection rather than returning the whole row', async () => {
      await makeUser({ email: 'ada@example.com' });

      const found = await repository.findByEmail('ada@example.com');

      expect(Object.keys(found!).sort()).toEqual([
        'createdAt',
        'email',
        'id',
        'name',
        'passwordHash',
        'profileImage',
        'role'
      ]);
    });

    it('returns null when no user has that email', async () => {
      expect(await repository.findByEmail('nobody@example.com')).toBeNull();
    });
  });
});
