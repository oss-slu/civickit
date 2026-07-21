// backend/src/middleware/__tests__/authorize.middleware.test.ts

import { Request, Response, NextFunction } from 'express';
import { describe, beforeEach, vi, it, expect } from 'vitest';
import { AppError } from '../../utils/errors';

// requirePermission builds its AuthRepository at module load, so the repository
// module has to be mocked before the middleware is imported.
const { findById } = vi.hoisted(() => ({ findById: vi.fn() }));

vi.mock('../../repositories/auth.repository', () => ({
  AuthRepository: class {
    findById = findById;
  },
}));

import { requirePermission } from '../authorize.middleware';

describe('requirePermission', () => {
  let req: Request;
  let res: Response;
  let next: NextFunction;

  beforeEach(() => {
    findById.mockReset();
    req = { userId: 'user-1' } as Request;
    res = {} as Response;
    next = vi.fn();
  });

  const errorPassedToNext = () => (next as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0];

  it('rejects a REPORTER attempting an admin-only action with 403', async () => {
    findById.mockResolvedValue({ id: 'user-1', role: 'REPORTER' });

    await requirePermission('update:issue_status')(req, res, next);

    const error = errorPassedToNext();
    expect(error).toBeInstanceOf(AppError);
    expect(error.statusCode).toBe(403);
  });

  it('allows an ADMIN to perform an admin-only action', async () => {
    findById.mockResolvedValue({ id: 'user-1', role: 'ADMIN' });

    await requirePermission('update:issue_status')(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });

  it('allows a REPORTER to perform a reporter-level action', async () => {
    findById.mockResolvedValue({ id: 'user-1', role: 'REPORTER' });

    await requirePermission('create:issue')(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });

  it('rejects an unknown user with 401', async () => {
    findById.mockResolvedValue(null);

    await requirePermission('update:issue_status')(req, res, next);

    expect(errorPassedToNext().statusCode).toBe(401);
  });

  it('rejects an unauthenticated request with 401 without hitting the database', async () => {
    req = {} as Request;

    await requirePermission('update:issue_status')(req, res, next);

    expect(errorPassedToNext().statusCode).toBe(401);
    expect(findById).not.toHaveBeenCalled();
  });

  it('forwards a repository failure instead of allowing the request through', async () => {
    findById.mockRejectedValue(new Error('database is down'));

    await requirePermission('update:issue_status')(req, res, next);

    expect(errorPassedToNext()).toBeInstanceOf(Error);
    expect(next).not.toHaveBeenCalledWith();
  });
});
