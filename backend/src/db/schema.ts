// backend/src/db/schema.ts
//
// Mirrors the schema Prisma owned. Two things here are easy to get wrong and
// silently destructive:
//
// - Table naming is inconsistent by history. `user`, `session`, `account` and
//   `verification` are lowercase (they were @@map'd for better-auth in
//   20260714141948); everything else is PascalCase. These strings are the real
//   table names, so they have to match exactly.
// - `createdAt` has a database default but `updatedAt` does not -- Prisma wrote
//   it from the client on every insert and update. Without $defaultFn and
//   $onUpdate below, every insert would fail the NOT NULL constraint.

import { createId } from '@paralleldrive/cuid2';
import {
  boolean,
  doublePrecision,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

// These types already exist in Postgres; the names must match what
// prisma/migrations created.
export const issueStatus = pgEnum('IssueStatus', [
  'REPORTED',
  'ACKNOWLEDGED',
  'IN_PROGRESS',
  'RESOLVED',
  'CLOSED',
  'COMMUNITY_RESOLVED',
]);

export const issueCategory = pgEnum('IssueCategory', [
  'POTHOLE',
  'STREETLIGHT',
  'GRAFFITI',
  'ILLEGAL_DUMPING',
  'BROKEN_SIDEWALK',
  'TRAFFIC_SIGNAL',
  'OTHER',
]);

export const eventStatus = pgEnum('EventStatus', [
  'PLANNED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
]);

export const role = pgEnum('Role', ['REPORTER', 'ADMIN']);

/** Prisma stored DateTime as TIMESTAMP(3); keeping the precision avoids drift. */
const timestamp3 = (name: string) => timestamp(name, { precision: 3 });

/** Prisma generated cuids in the client, not the database. */
const cuid = () => text('id').primaryKey().$defaultFn(() => createId());

/** No database default ever existed for these; the client supplied every value. */
const updatedAt = () =>
  timestamp3('updatedAt')
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date());

export const users = pgTable(
  'user',
  {
    id: cuid(),
    email: text('email').notNull().unique('user_email_key'),
    name: text('name').notNull(),
    passwordHash: text('passwordHash'),
    profileImage: text('profileImage'),
    role: role('role').notNull().default('REPORTER'),
    createdAt: timestamp3('createdAt').notNull().defaultNow(),
    updatedAt: updatedAt(),
    emailVerified: boolean('emailVerified').notNull().default(false),
    image: text('image'),
  },
  (table) => [index('user_email_idx').on(table.email)],
);

export const issues = pgTable(
  'Issue',
  {
    id: cuid(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    category: issueCategory('category').notNull(),
    status: issueStatus('status').notNull().default('REPORTED'),
    latitude: doublePrecision('latitude').notNull(),
    longitude: doublePrecision('longitude').notNull(),
    address: text('address'),
    district: text('district'),
    subregion: text('subregion'),
    name: text('name'),
    // Prisma left this nullable in the database but never wrote null. Declaring
    // it NOT NULL DEFAULT '{}' matches how the application has always behaved.
    images: text('images').array().notNull().default([]),
    createdAt: timestamp3('createdAt').notNull().defaultNow(),
    updatedAt: updatedAt(),
    locationSource: text('locationSource').notNull().default('device'),
    photoTakenAt: timestamp3('photoTakenAt'),
    photoTakenAtSource: text('photoTakenAtSource').notNull().default('device'),
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
    cityRefNumber: text('cityRefNumber'),
  },
  (table) => [
    index('Issue_latitude_longitude_idx').on(table.latitude, table.longitude),
    index('Issue_status_idx').on(table.status),
    index('Issue_category_idx').on(table.category),
    index('Issue_createdAt_idx').on(table.createdAt),
  ],
);

export const timelineEntries = pgTable(
  'TimelineEntry',
  {
    id: cuid(),
    message: text('message').notNull(),
    createdAt: timestamp3('createdAt').notNull().defaultNow(),
    issueId: text('issueId')
      .notNull()
      .references(() => issues.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
    status: issueStatus('status').notNull().default('REPORTED'),
    images: text('images').array().notNull().default([]),
  },
  (table) => [
    index('TimelineEntry_issueId_idx').on(table.issueId),
    index('TimelineEntry_createdAt_idx').on(table.createdAt),
  ],
);

export const upvotes = pgTable(
  'Upvote',
  {
    id: cuid(),
    createdAt: timestamp3('createdAt').notNull().defaultNow(),
    issueId: text('issueId')
      .notNull()
      .references(() => issues.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  },
  (table) => [
    // A user may upvote an issue once. upvote.service.ts turns the resulting
    // violation into a 409.
    uniqueIndex('Upvote_issueId_userId_key').on(table.issueId, table.userId),
    index('Upvote_issueId_idx').on(table.issueId),
  ],
);

export const events = pgTable(
  'Event',
  {
    id: cuid(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    status: eventStatus('status').notNull().default('PLANNED'),
    startTime: timestamp3('startTime').notNull(),
    endTime: timestamp3('endTime').notNull(),
    latitude: doublePrecision('latitude').notNull(),
    longitude: doublePrecision('longitude').notNull(),
    address: text('address').notNull(),
    createdAt: timestamp3('createdAt').notNull().defaultNow(),
    updatedAt: updatedAt(),
    organizerId: text('organizerId')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
    issueId: text('issueId').references(() => issues.id, {
      onDelete: 'set null',
      onUpdate: 'cascade',
    }),
  },
  (table) => [
    index('Event_startTime_idx').on(table.startTime),
    index('Event_status_idx').on(table.status),
  ],
);

export const eventRsvps = pgTable(
  'EventRsvp',
  {
    id: cuid(),
    // Free text in the original schema: "GOING", "MAYBE", "NOT_GOING".
    status: text('status').notNull(),
    createdAt: timestamp3('createdAt').notNull().defaultNow(),
    eventId: text('eventId')
      .notNull()
      .references(() => events.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
  },
  (table) => [
    uniqueIndex('EventRsvp_eventId_userId_key').on(table.eventId, table.userId),
    index('EventRsvp_eventId_idx').on(table.eventId),
  ],
);

// better-auth owns the three tables below. It supplies its own ids, so these
// deliberately do not default one.
export const sessions = pgTable(
  'session',
  {
    id: text('id').primaryKey(),
    expiresAt: timestamp3('expiresAt').notNull(),
    token: text('token').notNull().unique('session_token_key'),
    createdAt: timestamp3('createdAt').notNull().defaultNow(),
    updatedAt: updatedAt(),
    ipAddress: text('ipAddress'),
    userAgent: text('userAgent'),
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  },
  (table) => [index('session_userId_idx').on(table.userId)],
);

export const accounts = pgTable(
  'account',
  {
    id: text('id').primaryKey(),
    accountId: text('accountId').notNull(),
    providerId: text('providerId').notNull(),
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    accessToken: text('accessToken'),
    refreshToken: text('refreshToken'),
    idToken: text('idToken'),
    accessTokenExpiresAt: timestamp3('accessTokenExpiresAt'),
    refreshTokenExpiresAt: timestamp3('refreshTokenExpiresAt'),
    scope: text('scope'),
    password: text('password'),
    createdAt: timestamp3('createdAt').notNull().defaultNow(),
    updatedAt: updatedAt(),
  },
  (table) => [index('account_userId_idx').on(table.userId)],
);

export const verifications = pgTable(
  'verification',
  {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp3('expiresAt').notNull(),
    createdAt: timestamp3('createdAt').notNull().defaultNow(),
    updatedAt: updatedAt(),
  },
  (table) => [index('verification_identifier_idx').on(table.identifier)],
);

export type User = typeof users.$inferSelect;
export type Issue = typeof issues.$inferSelect;
export type TimelineEntry = typeof timelineEntries.$inferSelect;
export type Upvote = typeof upvotes.$inferSelect;
export type Role = (typeof role.enumValues)[number];
