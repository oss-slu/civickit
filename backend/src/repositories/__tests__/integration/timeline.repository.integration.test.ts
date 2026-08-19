// backend/src/repositories/__tests__/integration/timeline.repository.integration.test.ts

import { describe, it, expect } from 'vitest';
import { TimelineRepository } from '../../timeline.repository';
import { makeIssue, makeUser } from '../../../__tests__/integration/factories';

const repository = new TimelineRepository();

async function anIssueAndUser() {
  const author = await makeUser();
  const issue = await makeIssue(author.id);
  return { author, issue };
}

describe('TimelineRepository', () => {
  describe('createUpdate', () => {
    it('persists an entry against the issue and author', async () => {
      const { author, issue } = await anIssueAndUser();

      const entry = await repository.createUpdate({
        message: 'Crew dispatched',
        status: 'IN_PROGRESS',
        imageIds: ["id"],
        issueId: issue.id,
        userId: author.id,
      });

      expect(entry.id).toEqual(expect.any(String));
      expect(entry.message).toBe('Crew dispatched');
      expect(entry.status).toBe('IN_PROGRESS');
      expect(entry.imageIds).toEqual(["id"]);
      expect(entry.issueId).toBe(issue.id);
      expect(entry.userId).toBe(author.id);
      expect(entry.createdAt).toBeInstanceOf(Date);
    });

    it('stores an empty image array when images are omitted', async () => {
      const { author, issue } = await anIssueAndUser();

      const entry = await repository.createUpdate({
        message: 'Acknowledged',
        status: 'ACKNOWLEDGED',
        issueId: issue.id,
        userId: author.id,
      });

      expect(entry.imageIds).toEqual([]);
    });

    it('rejects an entry for an issue that does not exist', async () => {
      const author = await makeUser();

      await expect(
        repository.createUpdate({
          message: 'Orphan',
          status: 'REPORTED',
          issueId: 'no-such-issue',
          userId: author.id,
        }),
      ).rejects.toThrow();
    });
  });

  describe('findByIssue', () => {
    it('returns only entries on that issue', async () => {
      const { author, issue } = await anIssueAndUser();
      const otherIssue = await makeIssue(author.id, { title: 'Another issue' });

      await repository.createUpdate({
        message: 'On this issue',
        status: 'IN_PROGRESS',
        issueId: issue.id,
        userId: author.id,
      });
      await repository.createUpdate({
        message: 'On the other issue',
        status: 'IN_PROGRESS',
        issueId: otherIssue.id,
        userId: author.id,
      });

      const found = await repository.findByIssue(issue.id);

      expect(found).toHaveLength(1);
      expect(found[0].message).toBe('On this issue');
    });

    it('returns an empty array for an issue with no entries', async () => {
      const { issue } = await anIssueAndUser();

      expect(await repository.findByIssue(issue.id)).toEqual([]);
    });
  });

  describe('findByUser', () => {
    it('returns only entries written by that user', async () => {
      const { author, issue } = await anIssueAndUser();
      const other = await makeUser();

      await repository.createUpdate({
        message: 'By the author',
        status: 'IN_PROGRESS',
        issueId: issue.id,
        userId: author.id,
      });
      await repository.createUpdate({
        message: 'By someone else',
        status: 'IN_PROGRESS',
        issueId: issue.id,
        userId: other.id,
      });

      const found = await repository.findByUser(author.id);

      expect(found).toHaveLength(1);
      expect(found[0].message).toBe('By the author');
    });
  });
});
