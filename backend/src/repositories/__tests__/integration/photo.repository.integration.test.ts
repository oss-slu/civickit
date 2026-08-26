// backend/src/repositories/__tests__/integration/photo.repository.integration.test.ts

import { describe, it, expect } from 'vitest';
import { PhotoRepository } from '../../photo.repository';
import { makeIssue, makeUser } from '../../../__tests__/integration/factories';

const repository = new PhotoRepository();

const photoInput = (overrides: Record<string, unknown> = {}) => ({
  url: 'https://res.cloudinary.com/demo/image/upload/v1/civickit/issues/a.jpg',
  publicId: 'civickit/issues/a',
  width: 3024,
  height: 4032,
  photoTakenAt: '2026-08-24T14:03:11.000Z',
  photoTakenAtSource: 'exif' as const,
  ...overrides,
});

describe('PhotoRepository', () => {
  describe('createMany', () => {
    it('numbers positions by array order', async () => {
      const author = await makeUser();
      const issue = await makeIssue(author.id);

      const created = await repository.createMany(
        [
          photoInput({ url: 'https://res.cloudinary.com/demo/a.jpg' }),
          photoInput({ url: 'https://res.cloudinary.com/demo/b.jpg' }),
        ],
        { userId: author.id, issueId: issue.id },
      );

      expect(created.map((p) => p.position)).toEqual([0, 1]);
      expect(created[0].issueId).toBe(issue.id);
      expect(created[0].timelineEntryId).toBeNull();
    });

    it('returns an empty array without touching the database when given none', async () => {
      const author = await makeUser();
      const issue = await makeIssue(author.id);

      expect(
        await repository.createMany([], { userId: author.id, issueId: issue.id }),
      ).toEqual([]);
    });

    it('rejects a photo pointing at an issue that does not exist', async () => {
      const author = await makeUser();

      await expect(
        repository.createMany([photoInput()], {
          userId: author.id,
          issueId: 'not-a-real-id',
        }),
      ).rejects.toThrow();
    });
  });

  describe('findOriginalsByIssueIds', () => {
    it('returns only photos with no timelineEntryId, ordered by position', async () => {
      const author = await makeUser();
      const issue = await makeIssue(author.id);

      await repository.createMany(
        [
          photoInput({ url: 'https://res.cloudinary.com/demo/second.jpg' }),
          photoInput({ url: 'https://res.cloudinary.com/demo/first.jpg' }),
        ],
        { userId: author.id, issueId: issue.id },
      );

      const byIssue = await repository.findOriginalsByIssueIds([issue.id]);

      expect(byIssue.get(issue.id)?.map((p) => p.url)).toEqual([
        'https://res.cloudinary.com/demo/second.jpg',
        'https://res.cloudinary.com/demo/first.jpg',
      ]);
    });

    it('omits soft-deleted photos', async () => {
      const author = await makeUser();
      const issue = await makeIssue(author.id);

      const [photo] = await repository.createMany([photoInput()], {
        userId: author.id,
        issueId: issue.id,
      });
      await repository.softDelete(photo.id);

      const byIssue = await repository.findOriginalsByIssueIds([issue.id]);

      expect(byIssue.get(issue.id)).toBeUndefined();
    });

    it('returns an empty map for an empty id list', async () => {
      expect(await repository.findOriginalsByIssueIds([])).toEqual(new Map());
    });
  });
});
