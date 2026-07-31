// backend/src/__tests__/issue-validation.test.ts
import { describe, it, expect } from 'vitest';
import { createIssueSchema } from '../schemas/issue.schema';

const validBody = {
  title: 'Pothole on Main St',
  description: 'Large pothole causing traffic hazard',
  category: 'road',
  latitude: 38.6270,
  longitude: -90.1994,
  address: '123 Main St',
  images: ['https://example.com/photo.jpg'],
};

describe('createIssueSchema', () => {
  it('accepts a valid body', () => {
    const result = createIssueSchema.safeParse(validBody);
    expect(result.success).toBe(true);
  });

  it('rejects a body missing title', () => {
    const { title, ...rest } = validBody;
    const result = createIssueSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it('rejects a title under 3 characters', () => {
    const result = createIssueSchema.safeParse({ ...validBody, title: 'ab' });
    expect(result.success).toBe(false);
  });

  it('rejects images containing a non-URL string', () => {
    const result = createIssueSchema.safeParse({
      ...validBody,
      images: ['not-a-url'],
    });
    expect(result.success).toBe(false);
  });

  it('rejects an out-of-range latitude', () => {
    const result = createIssueSchema.safeParse({ ...validBody, latitude: 200 });
    expect(result.success).toBe(false);
  });

  it('strips unknown keys, preventing mass assignment', () => {
    const result = createIssueSchema.safeParse({
      ...validBody,
      userId: 'attacker-supplied',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).not.toHaveProperty('userId');
    }
  });
});
