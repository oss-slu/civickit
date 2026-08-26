// backend/src/schemas/photo.schema.ts

import { z } from 'zod';

/** Three per request, not three per issue -- updates add more over an issue's life. */
export const MAX_PHOTOS_PER_REQUEST = 3;

/**
 * Cloudinary serves from res.cloudinary.com. Restricting to it means a `url`
 * reaching <Image source={{uri}}> on the client can only point at an asset this
 * project uploaded, rather than anywhere on the internet.
 *
 * Placeholder hosts used by the seeder are deliberately not allowed: the seeder
 * writes rows directly and does not pass through this schema.
 */
const CLOUDINARY_HOST = 'res.cloudinary.com';

const cloudinaryUrl = z
  .string()
  .url()
  .refine((value) => {
    try {
      const parsed = new URL(value);
      return parsed.protocol === 'https:' && parsed.hostname === CLOUDINARY_HOST;
    } catch {
      return false;
    }
  }, `must be an https URL on ${CLOUDINARY_HOST}`);

export const photoSchema = z.object({
  url: cloudinaryUrl,
  publicId: z.string().max(500).optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  // Coerced for tolerance, then re-serialized: CreatePhotoDTO types this as an
  // ISO string, and handing the repository a Date instead would make the DTO a
  // lie that only shows up at runtime.
  photoTakenAt: z.coerce.date().transform((date) => date.toISOString()).optional(),
  photoTakenAtSource: z.enum(['exif', 'device']).optional(),
});

export const photosSchema = z.array(photoSchema).max(MAX_PHOTOS_PER_REQUEST);
