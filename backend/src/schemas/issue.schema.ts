import { z } from 'zod';

export const createIssueSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(5000).default(''),
  category: z.string().min(1),
  latitude: z.coerce.number().gte(-90).lte(90),
  longitude: z.coerce.number().gte(-180).lte(180),
  address: z.string().max(500).optional(),
  district: z.string().max(200).optional(),
  subregion: z.string().max(200).optional(),
  name: z.string().max(200).optional(),
  images: z.array(z.string().url()).max(10).default([]),
  locationSource: z.string().max(50).optional(),
  photoTakenAt: z.coerce.date().optional(),
  photoTakenAtSource: z.string().max(50).optional(),
}).strip();
