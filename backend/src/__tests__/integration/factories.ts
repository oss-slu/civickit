// backend/src/__tests__/integration/factories.ts
//
// Built on the repositories rather than on a database client directly, so these
// keep working across the ORM cutover.

import { CreateIssueDTO } from '@civickit/shared';
import { AuthRepository } from '../../repositories/auth.repository';
import { IssueRepository } from '../../repositories/issue.repository';

const authRepository = new AuthRepository();
const issueRepository = new IssueRepository();

// Rows are truncated between cases; this only has to be unique within a file.
let sequence = 0;

export async function makeUser(
  overrides: Partial<{ email: string; name: string; passwordHash: string }> = {},
) {
  sequence += 1;
  return authRepository.createUser({
    email: `user${sequence}@example.com`,
    name: `User ${sequence}`,
    passwordHash: 'not-a-real-hash',
    ...overrides,
  });
}

/** Downtown St. Louis, matching the seed data's area. */
export const ORIGIN = { latitude: 38.627, longitude: -90.1994 };

export function issueInput(overrides: Partial<CreateIssueDTO> = {}): CreateIssueDTO {
  return {
    title: 'Pothole on Main',
    description: 'Large pothole near the intersection',
    category: 'POTHOLE',
    status: 'REPORTED',
    address: '100 Main St',
    images: [],
    ...ORIGIN,
    ...overrides,
  };
}

export async function makeIssue(userId: string, overrides: Partial<CreateIssueDTO> = {}) {
  return issueRepository.create({ ...issueInput(overrides), userId });
}
