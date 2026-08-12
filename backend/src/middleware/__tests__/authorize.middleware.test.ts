// backend/src/middleware/__tests__/authorize.middleware.test.ts

import { Request, Response, NextFunction } from 'express';
import { describe, beforeEach, vi, it, expect } from 'vitest';
import { AppError } from '../../utils/errors';

// requirePermission builds its AuthRepository at module load, so the repository
// module has to be mocked before the middleware is imported.
const { findById, findByUser, findByUserAndOrg, findIssueById } = vi.hoisted(() => ({
  findById: vi.fn(),
  findByUser: vi.fn(),
  findByUserAndOrg: vi.fn(),
  findIssueById: vi.fn(),
}));

vi.mock('../../repositories/auth.repository', () => ({
  AuthRepository: class {
    findById = findById;
  },
}));

// Without these the org-scoped branches reach the real database, and a
// connection failure there is indistinguishable from a denial.
vi.mock('../../repositories/membership.repository', () => ({
  MembershipRepository: class {
    findByUser = findByUser;
    findByUserAndOrg = findByUserAndOrg;
  },
}));

vi.mock('../../repositories/issue.repository', () => ({
  IssueRepository: class {
    findById = findIssueById;
  },
}));

import { requirePermission } from '../authorize.middleware';

describe('requirePermission', () => {
  let req: Request;
  let res: Response;
  let next: NextFunction;

  beforeEach(() => {
    findById.mockReset();
    findByUser.mockReset();
    findByUserAndOrg.mockReset();
    findIssueById.mockReset();
    // Default: the caller belongs to no organization, so the org-scoped
    // branches deny unless a test says otherwise.
    findByUser.mockResolvedValue(null);
    findByUserAndOrg.mockResolvedValue(null);
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

  // A database outage is a 500, not a denial. Reporting it as 403 hides the
  // outage behind a message saying the user lacks access, which is both wrong
  // and unactionable.
  it('forwards a membership lookup failure rather than reporting it as a denial', async () => {
    findById.mockResolvedValue({ id: 'user-1', role: 'REPORTER' });
    findByUser.mockRejectedValue(new Error('database is down'));

    await requirePermission('update:issue_status')(req, res, next);

    const error = errorPassedToNext();
    expect(error).not.toBeInstanceOf(AppError);
    expect(error.message).toBe('database is down');
  });

  describe('org-scoped actions', () => {
    const CLAIMING_ORG = 'org-a';

    beforeEach(() => {
      findById.mockResolvedValue({ id: 'user-1', role: 'REPORTER' });
      req = { userId: 'user-1', params: { issueId: 'issue-1' } } as unknown as Request;
      // issue-1 is claimed by claimer-1, who responds for org-a.
      findIssueById.mockResolvedValue({ id: 'issue-1', claimedById: 'claimer-1' });
      findByUser.mockImplementation(async (id: string) =>
        id === 'claimer-1'
          ? { userId: 'claimer-1', organizationId: CLAIMING_ORG, role: 'ORG_MEMBER' }
          : null,
      );
    });

    it('allows a responder from the organization holding the claim', async () => {
      findByUser.mockImplementation(async (id: string) =>
        id === 'claimer-1'
          ? { userId: 'claimer-1', organizationId: CLAIMING_ORG, role: 'ORG_MEMBER' }
          : { userId: 'user-1', organizationId: CLAIMING_ORG, role: 'ORG_MEMBER' },
      );
      findByUserAndOrg.mockResolvedValue({
        userId: 'user-1',
        organizationId: CLAIMING_ORG,
        role: 'ORG_MEMBER',
      });

      await requirePermission('create:timeline_entry')(req, res, next);

      expect(next).toHaveBeenCalledWith();
      expect(findByUserAndOrg).toHaveBeenCalledWith('user-1', CLAIMING_ORG);
    });

    // Responding for one organization must not confer access to another
    // organization's claimed work.
    it('denies a responder whose organization does not hold the claim', async () => {
      findByUser.mockImplementation(async (id: string) =>
        id === 'claimer-1'
          ? { userId: 'claimer-1', organizationId: CLAIMING_ORG, role: 'ORG_MEMBER' }
          : { userId: 'user-1', organizationId: 'org-b', role: 'ORG_ADMIN' },
      );
      findByUserAndOrg.mockResolvedValue(null);

      await requirePermission('create:timeline_entry')(req, res, next);

      expect(errorPassedToNext().statusCode).toBe(403);
      expect(findByUserAndOrg).toHaveBeenCalledWith('user-1', CLAIMING_ORG);
    });

    it('rejects an update on an issue nobody has claimed', async () => {
      findByUser.mockImplementation(async (id: string) =>
        id === 'claimer-1'
          ? null
          : { userId: 'user-1', organizationId: CLAIMING_ORG, role: 'ORG_MEMBER' },
      );
      findIssueById.mockResolvedValue({ id: 'issue-1', claimedById: null });

      await requirePermission('create:timeline_entry')(req, res, next);

      expect(errorPassedToNext().statusCode).toBe(400);
    });
  });

  // Posting an update is how a status change is explained, and ADMIN could do
  // it before the claim flow existed. Routing it through the org branch locked
  // admins out of their own moderation tools.
  it('allows an ADMIN to post a timeline entry without an organization', async () => {
    findById.mockResolvedValue({ id: 'user-1', role: 'ADMIN' });

    await requirePermission('create:timeline_entry')(req, res, next);

    expect(next).toHaveBeenCalledWith();
    expect(findByUser).not.toHaveBeenCalled();
  });
});
