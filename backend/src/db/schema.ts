// backend/src/db/schema.ts
//
// Drizzle schema mirroring the existing Prisma models (see prisma/schema.prisma).
// Table and column names are pinned to the names Prisma created in the database
// (PascalCase tables such as "Issue"/"Upvote"; camelCase columns such as
// "createdAt"/"issueId"), so Drizzle and Prisma can operate on the same tables
// side by side during the phased migration tracked in #189.
//
// NOTE: the BetterAuth-managed tables ("user"/"session"/"account"/"verification")
// are intentionally left under Prisma for now and are added here only where a
// foreign key needs to reference them.

import {
  pgTable,
  pgEnum,
  text,
  timestamp,
  doublePrecision,
  boolean,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';
import cuid from 'cuid';

// --- Enums (native Postgres enum types created by Prisma) ---
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

// Shared column helpers.
const id = () =>
  text('id')
    .primaryKey()
    .$defaultFn(() => cuid());

const createdAt = () =>
  timestamp('createdAt', { precision: 3, mode: 'date' }).notNull().defaultNow();

// --- BetterAuth "user" table (referenced by app tables via FK) ---
export const user = pgTable(
  'user',
  {
    id: text('id').primaryKey(),
    email: text('email').notNull(),
    name: text('name').notNull(),
    passwordHash: text('passwordHash'),
    profileImage: text('profileImage'),
    role: role('role').notNull().default('REPORTER'),
    createdAt: createdAt(),
    updatedAt: timestamp('updatedAt', { precision: 3, mode: 'date' }).notNull(),
    emailVerified: boolean('emailVerified').notNull().default(false),
    image: text('image'),
  },
  (t) => [uniqueIndex('user_email_key').on(t.email), index('user_email_idx').on(t.email)],
);

// --- Issue ---
export const issue = pgTable(
  'Issue',
  {
    id: id(),
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
    images: text('images').array().notNull(),
    createdAt: createdAt(),
    updatedAt: timestamp('updatedAt', { precision: 3, mode: 'date' }).notNull(),
    locationSource: text('locationSource').notNull().default('device'),
    photoTakenAt: timestamp('photoTakenAt', { precision: 3, mode: 'date' }),
    photoTakenAtSource: text('photoTakenAtSource').notNull().default('device'),
    userId: text('userId')
      .notNull()
      .references(() => user.id),
    cityRefNumber: text('cityRefNumber'),
  },
  (t) => [
    index('Issue_status_idx').on(t.status),
    index('Issue_category_idx').on(t.category),
    index('Issue_createdAt_idx').on(t.createdAt),
  ],
);

// --- Upvote (converted in this phase) ---
export const upvote = pgTable(
  'Upvote',
  {
    id: id(),
    createdAt: createdAt(),
    issueId: text('issueId')
      .notNull()
      .references(() => issue.id, { onDelete: 'cascade' }),
    userId: text('userId')
      .notNull()
      .references(() => user.id),
  },
  (t) => [
    uniqueIndex('Upvote_issueId_userId_key').on(t.issueId, t.userId),
    index('Upvote_issueId_idx').on(t.issueId),
  ],
);

// --- TimelineEntry ---
export const timelineEntry = pgTable(
  'TimelineEntry',
  {
    id: id(),
    message: text('message').notNull(),
    createdAt: createdAt(),
    issueId: text('issueId')
      .notNull()
      .references(() => issue.id, { onDelete: 'cascade' }),
    userId: text('userId')
      .notNull()
      .references(() => user.id),
    status: issueStatus('status').notNull().default('REPORTED'),
    images: text('images').array().notNull(),
  },
  (t) => [index('TimelineEntry_issueId_idx').on(t.issueId), index('TimelineEntry_createdAt_idx').on(t.createdAt)],
);

// --- Event ---
export const event = pgTable(
  'Event',
  {
    id: id(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    status: eventStatus('status').notNull().default('PLANNED'),
    startTime: timestamp('startTime', { precision: 3, mode: 'date' }).notNull(),
    endTime: timestamp('endTime', { precision: 3, mode: 'date' }).notNull(),
    latitude: doublePrecision('latitude').notNull(),
    longitude: doublePrecision('longitude').notNull(),
    address: text('address').notNull(),
    createdAt: createdAt(),
    updatedAt: timestamp('updatedAt', { precision: 3, mode: 'date' }).notNull(),
    organizerId: text('organizerId')
      .notNull()
      .references(() => user.id),
    issueId: text('issueId').references(() => issue.id),
  },
  (t) => [index('Event_startTime_idx').on(t.startTime), index('Event_status_idx').on(t.status)],
);

// --- EventRsvp ---
export const eventRsvp = pgTable(
  'EventRsvp',
  {
    id: id(),
    status: text('status').notNull(),
    createdAt: createdAt(),
    eventId: text('eventId')
      .notNull()
      .references(() => event.id, { onDelete: 'cascade' }),
    userId: text('userId')
      .notNull()
      .references(() => user.id),
  },
  (t) => [
    uniqueIndex('EventRsvp_eventId_userId_key').on(t.eventId, t.userId),
    index('EventRsvp_eventId_idx').on(t.eventId),
  ],
);
