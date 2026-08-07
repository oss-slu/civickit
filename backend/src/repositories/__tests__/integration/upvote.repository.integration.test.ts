// backend/src/repositories/__tests__/integration/upvote.repository.integration.test.ts

import { describe, it, expect } from 'vitest';
import { UpvoteRepository } from '../../upvote.repository';
import { makeIssue, makeUser } from '../../../__tests__/integration/factories';

const repository = new UpvoteRepository();

async function anIssueAndUser() {
  const author = await makeUser();
  const issue = await makeIssue(author.id);
  return { author, issue };
}

describe('UpvoteRepository', () => {
  describe('createUpvote', () => {
    it('persists an upvote', async () => {
      const { author, issue } = await anIssueAndUser();

      const upvote = await repository.createUpvote(issue.id, author.id);

      expect(upvote.issueId).toBe(issue.id);
      expect(upvote.userId).toBe(author.id);
      expect(upvote.createdAt).toBeInstanceOf(Date);
    });

    // upvote.service.ts turns this into a 409, so the rejection is load-bearing.
    it('rejects a second upvote from the same user on the same issue', async () => {
      const { author, issue } = await anIssueAndUser();
      await repository.createUpvote(issue.id, author.id);

      await expect(repository.createUpvote(issue.id, author.id)).rejects.toThrow();
    });

    it('allows different users to upvote the same issue', async () => {
      const { author, issue } = await anIssueAndUser();
      const other = await makeUser();

      await repository.createUpvote(issue.id, author.id);
      await repository.createUpvote(issue.id, other.id);

      expect(await repository.countUpvotes(issue.id)).toBe(2);
    });
  });

  describe('deleteUpvote', () => {
    it('removes an existing upvote', async () => {
      const { author, issue } = await anIssueAndUser();
      await repository.createUpvote(issue.id, author.id);

      await repository.deleteUpvote(issue.id, author.id);

      expect(await repository.exists(issue.id, author.id)).toBe(false);
    });

    // upvote.service.ts turns this into a 404, so it must keep throwing.
    it('rejects when there is no such upvote', async () => {
      const { author, issue } = await anIssueAndUser();

      await expect(repository.deleteUpvote(issue.id, author.id)).rejects.toThrow();
    });

    it('leaves other users’ upvotes on the issue alone', async () => {
      const { author, issue } = await anIssueAndUser();
      const other = await makeUser();
      await repository.createUpvote(issue.id, author.id);
      await repository.createUpvote(issue.id, other.id);

      await repository.deleteUpvote(issue.id, author.id);

      expect(await repository.exists(issue.id, other.id)).toBe(true);
      expect(await repository.countUpvotes(issue.id)).toBe(1);
    });
  });

  describe('countUpvotes', () => {
    it('returns 0 for an issue with no upvotes', async () => {
      const { issue } = await anIssueAndUser();

      expect(await repository.countUpvotes(issue.id)).toBe(0);
    });

    it('counts only upvotes on the given issue', async () => {
      const { author, issue } = await anIssueAndUser();
      const otherIssue = await makeIssue(author.id, { title: 'Another issue' });
      await repository.createUpvote(issue.id, author.id);
      await repository.createUpvote(otherIssue.id, author.id);

      expect(await repository.countUpvotes(issue.id)).toBe(1);
    });
  });

  describe('exists', () => {
    it('is true only for the pairing that was created', async () => {
      const { author, issue } = await anIssueAndUser();
      const other = await makeUser();
      await repository.createUpvote(issue.id, author.id);

      expect(await repository.exists(issue.id, author.id)).toBe(true);
      expect(await repository.exists(issue.id, other.id)).toBe(false);
    });
  });

  describe('findByUser', () => {
    it('returns only that user’s upvotes', async () => {
      const { author, issue } = await anIssueAndUser();
      const other = await makeUser();
      const otherIssue = await makeIssue(author.id, { title: 'Another issue' });

      await repository.createUpvote(issue.id, author.id);
      await repository.createUpvote(otherIssue.id, other.id);

      const found = await repository.findByUser(author.id);

      expect(found).toHaveLength(1);
      expect(found[0].issueId).toBe(issue.id);
    });

    it('returns an empty array when the user has upvoted nothing', async () => {
      const user = await makeUser();

      expect(await repository.findByUser(user.id)).toEqual([]);
    });
  });
});
