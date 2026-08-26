// backend/src/repositories/__tests__/integration/issue.repository.integration.test.ts

import { describe, it, expect } from 'vitest';
import { IssueRepository } from '../../issue.repository';
import { UpvoteRepository } from '../../upvote.repository';
import { eq } from 'drizzle-orm';
import db from '../../../db';
import { issues, photos } from '../../../db/schema';
import { PhotoRepository } from '../../photo.repository';
import { ORIGIN, issueInput, makeIssue, makeUser } from '../../../__tests__/integration/factories';

const repository = new IssueRepository();
const upvotes = new UpvoteRepository();

// createdAt is TIMESTAMP(3), so rows created back to back can share a value.
// Ordering assertions need them measurably apart.
const apart = () => new Promise((resolve) => setTimeout(resolve, 5));

// ~0.01 degrees of latitude is ~1.11km.
const METRES_PER_DEGREE_LAT = 111_000;
const offsetNorth = (metres: number) => ({
  latitude: ORIGIN.latitude + metres / METRES_PER_DEGREE_LAT,
  longitude: ORIGIN.longitude,
});

describe('IssueRepository', () => {
  describe('createWithPhotos', () => {
    const CLOUDINARY_URL = 'https://res.cloudinary.com/demo/image/upload/a.jpg';

    const create = (userId: string, overrides = {}) =>
      repository.createWithPhotos({ ...issueInput(overrides), userId, status: 'REPORTED' });

    it('persists the issue and returns the author projection and upvote count', async () => {
      const author = await makeUser({ name: 'Ada Lovelace' });

      const { issue } = await create(author.id);

      expect(issue.id).toEqual(expect.any(String));
      expect(issue.title).toBe('Pothole on Main');
      expect(issue.user).toEqual({ id: author.id, name: 'Ada Lovelace' });
      expect(issue.upvoteCount).toBe(0);
    });

    it('applies the column defaults for status and locationSource', async () => {
      const author = await makeUser();

      const { issue } = await repository.createWithPhotos({
        ...issueInput(),
        userId: author.id,
        status: undefined as never,
      });

      expect(issue.status).toBe('REPORTED');
      expect(issue.locationSource).toBe('device');
    });

    it('round-trips the optional location fields', async () => {
      const author = await makeUser();

      const { issue } = await create(author.id, {
        district: 'Downtown',
        subregion: 'Central West End',
        name: 'Near the fountain',
      });

      expect(issue.district).toBe('Downtown');
      expect(issue.subregion).toBe('Central West End');
      expect(issue.name).toBe('Near the fountain');
    });

    it('writes the issue and its photos together', async () => {
      const author = await makeUser();

      const { issue, photos } = await create(author.id, {
        photos: [{ url: CLOUDINARY_URL }],
      });

      expect(photos).toHaveLength(1);
      expect(photos[0].issueId).toBe(issue.id);
      expect(photos[0].timelineEntryId).toBeNull();
      expect(photos[0].position).toBe(0);
    });

    it('writes neither the issue nor its photos when the author does not exist', async () => {
      const before = await db.select().from(issues);

      await expect(
        repository.createWithPhotos({
          ...issueInput({ photos: [{ url: CLOUDINARY_URL }] }),
          userId: 'no-such-user',
          status: 'REPORTED',
        }),
      ).rejects.toThrow();

      expect(await db.select().from(issues)).toHaveLength(before.length);
      expect(await db.select().from(photos)).toHaveLength(0);
    });

    it('cascades photo deletion when the issue is deleted', async () => {
      const author = await makeUser();
      const { issue } = await create(author.id, { photos: [{ url: CLOUDINARY_URL }] });

      await db.delete(issues).where(eq(issues.id, issue.id));

      const photoRepository = new PhotoRepository();
      expect(await photoRepository.findOriginalsByIssueIds([issue.id])).toEqual(new Map());
    });
  });

  describe('findById', () => {
    it('returns the issue with the author projection and a live upvote count', async () => {
      const author = await makeUser({ name: 'Ada Lovelace' });
      const issue = await makeIssue(author.id);
      await upvotes.createUpvote(issue.id, author.id);

      const found = await repository.findById(issue.id);

      expect(found!.id).toBe(issue.id);
      expect(found!.user).toEqual({ id: author.id, name: 'Ada Lovelace' });
      expect(found!.upvoteCount).toBe(1);
    });

    it('returns null for an unknown id', async () => {
      expect(await repository.findById('no-such-issue')).toBeNull();
    });
  });

  describe('findByUser', () => {
    it('returns only that user’s issues', async () => {
      const author = await makeUser();
      const other = await makeUser();
      const mine = await makeIssue(author.id, { title: 'Mine' });
      await makeIssue(other.id, { title: 'Theirs' });

      const found = await repository.findByUser(author.id);

      expect(found).toHaveLength(1);
      expect(found[0].id).toBe(mine.id);
    });

    it('counts upvotes per issue', async () => {
      const author = await makeUser();
      const voter = await makeUser();
      const popular = await makeIssue(author.id, { title: 'Popular' });
      const ignored = await makeIssue(author.id, { title: 'Ignored' });
      await upvotes.createUpvote(popular.id, author.id);
      await upvotes.createUpvote(popular.id, voter.id);

      const found = await repository.findByUser(author.id);
      const byId = Object.fromEntries(found.map((issue) => [issue.id, issue.upvoteCount]));

      expect(byId[popular.id]).toBe(2);
      expect(byId[ignored.id]).toBe(0);
    });

    it('respects the limit', async () => {
      const author = await makeUser();
      await makeIssue(author.id, { title: 'One' });
      await makeIssue(author.id, { title: 'Two' });
      await makeIssue(author.id, { title: 'Three' });

      expect(await repository.findByUser(author.id, 2)).toHaveLength(2);
    });

    it('returns an empty array for a user with no issues', async () => {
      const user = await makeUser();

      expect(await repository.findByUser(user.id)).toEqual([]);
    });
  });

  describe('findByUpvoter', () => {
    it('returns only issues the user upvoted, whoever reported them', async () => {
      const voter = await makeUser();
      const author = await makeUser();
      const upvoted = await makeIssue(author.id, { title: 'Upvoted' });
      await makeIssue(author.id, { title: 'Not upvoted' });
      await upvotes.createUpvote(upvoted.id, voter.id);

      const found = await repository.findByUpvoter(voter.id);

      expect(found).toHaveLength(1);
      expect(found[0].id).toBe(upvoted.id);
    });

    it('does not return an issue upvoted only by someone else', async () => {
      const voter = await makeUser();
      const other = await makeUser();
      const issue = await makeIssue(other.id);
      await upvotes.createUpvote(issue.id, other.id);

      expect(await repository.findByUpvoter(voter.id)).toEqual([]);
    });

    it('returns one row per issue even when several people upvoted it', async () => {
      const voter = await makeUser();
      const other = await makeUser();
      const issue = await makeIssue(other.id);
      await upvotes.createUpvote(issue.id, voter.id);
      await upvotes.createUpvote(issue.id, other.id);

      const found = await repository.findByUpvoter(voter.id);

      expect(found).toHaveLength(1);
      expect(found[0].upvoteCount).toBe(2);
    });

    it('orders newest first', async () => {
      const voter = await makeUser();
      const author = await makeUser();
      const older = await makeIssue(author.id, { title: 'Older' });
      await apart();
      const newer = await makeIssue(author.id, { title: 'Newer' });
      await upvotes.createUpvote(older.id, voter.id);
      await upvotes.createUpvote(newer.id, voter.id);

      const found = await repository.findByUpvoter(voter.id);

      expect(found.map((issue) => issue.id)).toEqual([newer.id, older.id]);
    });

    it('respects the limit', async () => {
      const voter = await makeUser();
      const author = await makeUser();
      for (const title of ['One', 'Two', 'Three']) {
        const issue = await makeIssue(author.id, { title });
        await upvotes.createUpvote(issue.id, voter.id);
        await apart();
      }

      expect(await repository.findByUpvoter(voter.id, 2)).toHaveLength(2);
    });
  });

  describe('findNearby', () => {
    it('returns issues inside the radius, nearest first, with a distance', async () => {
      const author = await makeUser();
      const here = await makeIssue(author.id, { title: 'Here', ...ORIGIN });
      const nearby = await makeIssue(author.id, {
        title: 'Nearby',
        ...offsetNorth(500),
      });

      const found = await repository.findNearby(ORIGIN.latitude, ORIGIN.longitude, 1000);

      expect(found.map((issue) => issue.id)).toEqual([here.id, nearby.id]);
      expect(found[0].distance).toBeCloseTo(0, 0);
      expect(found[1].distance).toBeGreaterThan(400);
      expect(found[1].distance).toBeLessThan(600);
    });

    it('excludes issues beyond the radius', async () => {
      const author = await makeUser();
      const here = await makeIssue(author.id, { title: 'Here', ...ORIGIN });
      await makeIssue(author.id, { title: 'Far', ...offsetNorth(5000) });

      const found = await repository.findNearby(ORIGIN.latitude, ORIGIN.longitude, 1000);

      expect(found.map((issue) => issue.id)).toEqual([here.id]);
    });

    it('widens with the radius', async () => {
      const author = await makeUser();
      await makeIssue(author.id, { title: 'Here', ...ORIGIN });
      await makeIssue(author.id, { title: 'Far', ...offsetNorth(5000) });

      const found = await repository.findNearby(ORIGIN.latitude, ORIGIN.longitude, 10_000);

      expect(found).toHaveLength(2);
    });

    it('reports upvoteCount as a flat number', async () => {
      const author = await makeUser();
      const voter = await makeUser();
      const issue = await makeIssue(author.id, { ...ORIGIN });
      await upvotes.createUpvote(issue.id, author.id);
      await upvotes.createUpvote(issue.id, voter.id);

      const [found] = await repository.findNearby(ORIGIN.latitude, ORIGIN.longitude, 1000);

      expect(found.upvoteCount).toBe(2);
    });

    it('respects the limit', async () => {
      const author = await makeUser();
      await makeIssue(author.id, { ...offsetNorth(100) });
      await makeIssue(author.id, { ...offsetNorth(200) });
      await makeIssue(author.id, { ...offsetNorth(300) });

      const found = await repository.findNearby(
        ORIGIN.latitude,
        ORIGIN.longitude,
        1000,
        2,
      );

      expect(found).toHaveLength(2);
    });

    it('returns an empty array when nothing is in range', async () => {
      const author = await makeUser();
      await makeIssue(author.id, { ...offsetNorth(5000) });

      expect(
        await repository.findNearby(ORIGIN.latitude, ORIGIN.longitude, 1000),
      ).toEqual([]);
    });
  });

  describe('updateStatus', () => {
    it('updates the status and returns the updated row', async () => {
      const author = await makeUser();
      const issue = await makeIssue(author.id);

      const updated = await repository.updateStatus(issue.id, { status: 'RESOLVED' });

      expect(updated.status).toBe('RESOLVED');
      expect((await repository.findById(issue.id))!.status).toBe('RESOLVED');
    });

    it('rejects an unknown id', async () => {
      await expect(
        repository.updateStatus('no-such-issue', { status: 'RESOLVED' }),
      ).rejects.toThrow();
    });
  });
});
