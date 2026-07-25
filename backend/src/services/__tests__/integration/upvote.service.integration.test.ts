// backend/src/services/__tests__/integration/upvote.service.integration.test.ts
//
// The unit tests for this service feed it hand-built error objects, so they
// only ever prove it reacts to the shape the test author imagined. These run a
// real duplicate and a real missing row through the driver, which is the only
// way to prove the status codes the API actually returns.
//
// Written after the unit tests passed against a fabricated `{ code: '23505' }`
// while the real endpoint answered 500: Drizzle wraps driver errors, so the
// SQLSTATE sits on `cause`.

import { describe, it, expect } from 'vitest';
import { UpvoteService } from '../../upvote.service';
import { UpvoteRepository } from '../../../repositories/upvote.repository';
import { makeIssue, makeUser } from '../../../__tests__/integration/factories';

const service = new UpvoteService(new UpvoteRepository());

async function anIssueAndVoter() {
  const author = await makeUser();
  const voter = await makeUser();
  const issue = await makeIssue(author.id);
  return { issue, voter };
}

describe('UpvoteService against a real database', () => {
  describe('upvoteIssue', () => {
    it('records the upvote and returns the new count', async () => {
      const { issue, voter } = await anIssueAndVoter();

      expect(await service.upvoteIssue(issue.id, voter.id)).toEqual({
        upvoted: true,
        upvoteCount: 1,
      });
    });

    it('answers 409 for a duplicate rather than letting the driver error escape', async () => {
      const { issue, voter } = await anIssueAndVoter();
      await service.upvoteIssue(issue.id, voter.id);

      await expect(service.upvoteIssue(issue.id, voter.id)).rejects.toEqual({
        status: 409,
        message: 'Issue already upvoted',
      });
    });

    it('leaves the count alone when the duplicate is rejected', async () => {
      const { issue, voter } = await anIssueAndVoter();
      await service.upvoteIssue(issue.id, voter.id);

      await expect(service.upvoteIssue(issue.id, voter.id)).rejects.toBeTruthy();

      expect(await service.getUpvoteCount(issue.id, voter.id)).toEqual({
        upvoteCount: 1,
        upvoted: true,
      });
    });
  });

  describe('removeUpvote', () => {
    it('removes the upvote and returns the new count', async () => {
      const { issue, voter } = await anIssueAndVoter();
      await service.upvoteIssue(issue.id, voter.id);

      expect(await service.removeUpvote(issue.id, voter.id)).toEqual({
        upvoted: false,
        upvoteCount: 0,
      });
    });

    it('answers 404 when there is no upvote to remove', async () => {
      const { issue, voter } = await anIssueAndVoter();

      await expect(service.removeUpvote(issue.id, voter.id)).rejects.toEqual({
        status: 404,
        message: 'Upvote does not exist',
      });
    });

    it('answers 404 again after the upvote has already been removed', async () => {
      const { issue, voter } = await anIssueAndVoter();
      await service.upvoteIssue(issue.id, voter.id);
      await service.removeUpvote(issue.id, voter.id);

      await expect(service.removeUpvote(issue.id, voter.id)).rejects.toEqual({
        status: 404,
        message: 'Upvote does not exist',
      });
    });
  });

  describe('getUpvoteCount', () => {
    it('reports whether this particular user has upvoted', async () => {
      const { issue, voter } = await anIssueAndVoter();
      const other = await makeUser();
      await service.upvoteIssue(issue.id, other.id);

      expect(await service.getUpvoteCount(issue.id, voter.id)).toEqual({
        upvoteCount: 1,
        upvoted: false,
      });
    });
  });
});
