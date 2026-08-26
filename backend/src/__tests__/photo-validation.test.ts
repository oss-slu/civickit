// backend/src/__tests__/photo-validation.test.ts

import { describe, it, expect } from 'vitest';
import { photosSchema } from '../schemas/photo.schema';

const validPhoto = {
  url: 'https://res.cloudinary.com/demo/image/upload/v1/civickit/issues/a.jpg',
  publicId: 'civickit/issues/a',
  width: 3024,
  height: 4032,
  photoTakenAt: '2026-08-24T14:03:11.000Z',
  photoTakenAtSource: 'exif',
};

describe('photosSchema', () => {
  it('accepts a well-formed photo', () => {
    expect(photosSchema.safeParse([validPhoto]).success).toBe(true);
  });

  it('accepts a photo carrying only a url', () => {
    expect(photosSchema.safeParse([{ url: validPhoto.url }]).success).toBe(true);
  });

  it('rejects a url that is not on the Cloudinary delivery host', () => {
    const result = photosSchema.safeParse([
      { ...validPhoto, url: 'https://evil.example.com/tracker.gif' },
    ]);
    expect(result.success).toBe(false);
  });

  it('rejects a url that is not a url at all', () => {
    expect(photosSchema.safeParse([{ ...validPhoto, url: 'not-a-url' }]).success).toBe(false);
  });

  it('rejects more than three photos in one request', () => {
    expect(photosSchema.safeParse(Array(4).fill(validPhoto)).success).toBe(false);
  });

  it('rejects a malformed capture date', () => {
    expect(
      photosSchema.safeParse([{ ...validPhoto, photoTakenAt: 'yesterday' }]).success,
    ).toBe(false);
  });

  it('rejects a negative width', () => {
    expect(photosSchema.safeParse([{ ...validPhoto, width: -1 }]).success).toBe(false);
  });

  it('rejects an unknown timestamp source', () => {
    expect(
      photosSchema.safeParse([{ ...validPhoto, photoTakenAtSource: 'guess' }]).success,
    ).toBe(false);
  });
});
