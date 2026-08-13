// backend/src/repositories/__tests__/integration/issue.claim.integration.test.ts
//
// Exclusivity of a claim is enforced by the `claimedById IS NULL` predicate in
// the UPDATE, not by anything the service can check first. Whether that holds
// under a genuine concurrent race is a property of Postgres row locking, so it
// is asserted here rather than against a mock.

import { describe, it, expect } from 'vitest';
import { IssueRepository } from '../../issue.repository';
import { makeIssue, makeUser } from '../../../__tests__/integration/factories';

const repository = new IssueRepository();

describe('IssueRepository.claimIssue', () => {
  it('claims an issue that nobody holds', async () => {
    const reporter = await makeUser();
    const responder = await makeUser();
    const issue = await makeIssue(reporter.id);

    const claimed = await repository.claimIssue(issue.id, { claimedById: responder.id });

    expect(claimed).toMatchObject({ id: issue.id, claimedById: responder.id });
  });

  it('refuses to reassign an issue another user already holds', async () => {
    const reporter = await makeUser();
    const first = await makeUser();
    const second = await makeUser();
    const issue = await makeIssue(reporter.id);

    await repository.claimIssue(issue.id, { claimedById: first.id });
    const stolen = await repository.claimIssue(issue.id, { claimedById: second.id });

    expect(stolen).toBeNull();
    // The original claim survives untouched.
    expect(await repository.findById(issue.id)).toMatchObject({ claimedById: first.id });
  });

  it('returns null for an issue that does not exist', async () => {
    expect(await repository.claimIssue('no-such-issue', { claimedById: 'nobody' })).toBeNull();
  });

  // Two organizations pressing Claim at the same moment. Exactly one may win;
  // a read-then-write in the service would let both through.
  it('lets exactly one of two concurrent claims win', async () => {
    const reporter = await makeUser();
    const a = await makeUser();
    const b = await makeUser();
    const issue = await makeIssue(reporter.id);

    const results = await Promise.all([
      repository.claimIssue(issue.id, { claimedById: a.id }),
      repository.claimIssue(issue.id, { claimedById: b.id }),
    ]);

    expect(results.filter(Boolean)).toHaveLength(1);

    const winner = results.find(Boolean)!;
    expect(await repository.findById(issue.id)).toMatchObject({
      claimedById: winner.claimedById,
    });
  });

  it('releases a claim so the issue can be claimed again', async () => {
    const reporter = await makeUser();
    const first = await makeUser();
    const second = await makeUser();
    const issue = await makeIssue(reporter.id);

    await repository.claimIssue(issue.id, { claimedById: first.id });
    await repository.releaseIssue(issue.id);

    const reclaimed = await repository.claimIssue(issue.id, { claimedById: second.id });

    expect(reclaimed).toMatchObject({ claimedById: second.id });
  });
});
