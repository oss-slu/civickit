// backend/src/routes/__tests__/issue.routes.auth.test.ts
//
// Issue submission must require authentication (#152). Unlike the authz test in
// this folder, these tests exercise the REAL authMiddleware so an unauthenticated
// POST /api/issues is rejected with 401 before any controller/service runs.

import express from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { describe, it, expect, vi } from 'vitest';
import { errorHandler } from '../../middleware/error.middleware';
import { JWT_SECRET } from '../../config/env';

// Stub the service so an authenticated request does not touch the database; the
// auth middleware (the subject under test) runs for real before the controller.
const { createIssue } = vi.hoisted(() => ({ createIssue: vi.fn() }));
vi.mock('../../services/issue.service', () => ({
  IssueService: class {
    createIssue = createIssue;
  },
}));

import issueRoutes from '../issue.routes';

const app = express();
app.use(express.json());
app.use('/api/issues', issueRoutes);
app.use(errorHandler);

const validBody = {
  title: 'Broken sidewalk',
  description: 'Cracked pavement near campus',
  category: 'BROKEN_SIDEWALK',
  latitude: 38.6352,
  longitude: -90.2318,
  images: [],
};

describe('POST /api/issues authentication (#152)', () => {
  it('rejects a request with no Authorization header', async () => {
    const res = await request(app).post('/api/issues').send(validBody);

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Authorization header missing');
  });

  it('rejects a non-Bearer Authorization header', async () => {
    const res = await request(app)
      .post('/api/issues')
      .set('Authorization', 'Basic abc123')
      .send(validBody);

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid auth format');
  });

  it('rejects a Bearer scheme with no token', async () => {
    // HTTP header values are trimmed in transit, so "Bearer " arrives as "Bearer"
    // and fails the "Bearer " prefix check.
    const res = await request(app)
      .post('/api/issues')
      .set('Authorization', 'Bearer')
      .send(validBody);

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid auth format');
  });

  it('rejects an invalid/garbage token', async () => {
    const res = await request(app)
      .post('/api/issues')
      .set('Authorization', 'Bearer not-a-real-jwt')
      .send(validBody);

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid or expired token');
  });

  it('rejects a token signed with the wrong secret', async () => {
    const forged = jwt.sign({ userId: 'user-1' }, 'the-wrong-secret');

    const res = await request(app)
      .post('/api/issues')
      .set('Authorization', `Bearer ${forged}`)
      .send(validBody);

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid or expired token');
  });

  it('passes authentication with a validly signed token and creates the issue', async () => {
    // A correctly signed token must clear the auth gate and reach the controller.
    createIssue.mockResolvedValueOnce({ id: 'issue-1', ...validBody });
    const token = jwt.sign({ userId: 'user-1' }, JWT_SECRET);

    const res = await request(app)
      .post('/api/issues')
      .set('Authorization', `Bearer ${token}`)
      .send(validBody);

    expect(res.status).toBe(201);
    expect(createIssue).toHaveBeenCalledWith(
      expect.objectContaining({ latitude: validBody.latitude, longitude: validBody.longitude }),
      'user-1',
    );
  });
});
