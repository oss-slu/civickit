// backend/src/routes/__tests__/issue.routes.authz.test.ts
//
// Every route that can change an issue's status must sit behind a permission
// gate. PATCH /:issueId/status was gated when roles landed but POST
// /:issueId/update, which also writes the status, was not — these tests keep
// both closed. (The update route now gates on create:timeline_entry; what
// matters here is that a REPORTER is still refused by both.)

import express from 'express';
import request from 'supertest';
import { describe, beforeEach, vi, it, expect } from 'vitest';
import { errorHandler } from '../../middleware/error.middleware';

const { findById, updateStatus, findByUser } = vi.hoisted(() => ({
  findById: vi.fn(),
  updateStatus: vi.fn(),
  findByUser: vi.fn(),
}));

vi.mock('../../middleware/auth.middleware', () => ({
  authMiddleware: (req: express.Request, _res: express.Response, next: express.NextFunction) => {
    req.userId = 'user-1';
    next();
  },
}));

vi.mock('../../repositories/auth.repository', () => ({
  AuthRepository: class {
    findById = findById;
  },
}));

vi.mock('../../services/issue.service', () => ({
  IssueService: class {
    updateStatus = updateStatus;
  },
}));

// The status gate falls through to an org-membership check. Left unmocked it
// reaches the real database, and the connection failure -- not the role -- is
// what the assertion would be measuring.
vi.mock('../../repositories/membership.repository', () => ({
  MembershipRepository: class {
    findByUser = findByUser;
    findByUserAndOrg = vi.fn().mockResolvedValue(null);
  },
}));

import issueRoutes from '../issue.routes';

const app = express();
app.use(express.json());
app.use('/api/issues', issueRoutes);
app.use(errorHandler);

const statusChangingRoutes = [
  { name: 'PATCH /:issueId/status', send: () => request(app).patch('/api/issues/issue-1/status') },
  { name: 'POST /:issueId/update', send: () => request(app).post('/api/issues/issue-1/update') },
];

describe('issue status authorization', () => {
  beforeEach(() => {
    findById.mockReset();
    updateStatus.mockReset();
    findByUser.mockReset();
    // A REPORTER responds for no organization, so the org branch denies too.
    findByUser.mockResolvedValue(null);
    updateStatus.mockResolvedValue({ id: 'issue-1', status: 'RESOLVED' });
  });

  for (const route of statusChangingRoutes) {
    it(`refuses a REPORTER on ${route.name} and never writes the status`, async () => {
      findById.mockResolvedValue({ id: 'user-1', role: 'REPORTER' });

      const response = await route.send().send({ status: 'RESOLVED' });

      expect(response.status).toBe(403);
      expect(updateStatus).not.toHaveBeenCalled();
    });
  }
});
