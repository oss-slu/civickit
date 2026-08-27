// filepath: backend/src/seed-utils.ts
/**
 * Seed Utilities
 *
 * Contains the core logic for seeding the database with issues and users.
 * Follows best practices from similar seed scripts:
 * - Safe to run multiple times (cleans before seeding)
 * - Proper foreign key order for deletions
 * - Dry-run support
 * - Detailed logging
 */

import { count, eq, sql } from 'drizzle-orm';
import db from './db/index.js';
import * as schema from './db/schema.js';
import {
    organizationTemplates,
    orgMembershipTemplates,
    userTemplates,
    type SeedIssueTemplate,
    type SeedOrgMembershipTemplate,
    type SeedOrgTemplate,
    type SeedUserTemplate,
} from './seed-data.js';
import { uploadImageToCloudinary } from './utils/cloudinary-upload.js';
import * as path from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';
import bcrypt from 'bcryptjs';

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const IMAGES_DIR = path.join(process.cwd(), 'images');

// Logging utility
function log(level: 'info' | 'warn' | 'error', message: string, data?: unknown) {
    const ts = new Date().toISOString();
    const prefix = `[${ts}] [${level.toUpperCase()}]`;
    if (data !== undefined) {
        console.log(prefix, message, data);
    } else {
        console.log(prefix, message);
    }
}

/**
 * Clean all data from the database (issues, timeline entries, upvotes, events,
 * organizations, memberships, users)
 * Deletes in reverse FK order to respect foreign key constraints
 *
 * Photo is absent on purpose: issue and timeline photos cascade from their
 * parent rows. A *profile* photo has neither issueId nor timelineEntryId, so it
 * cascades from nothing, and Photo.userId is onDelete: restrict -- if the users
 * delete below ever starts failing on a Photo FK, that is why. No seed fixture
 * writes a profile photo today.
 */
export async function cleanupDatabase() {
    if (DRY_RUN) {
        log('info', 'DRY RUN: Would delete all rows');
        return;
    }

    log('info', 'Deleting all rows...');

    // Delete in reverse FK order
    await db.delete(schema.upvotes);
    await db.delete(schema.timelineEntries);
    await db.delete(schema.eventRsvps);
    await db.delete(schema.events);
    await db.delete(schema.issues);
    // OrgMembership.organizationId references Organization, so it goes first.
    // Its userId is onDelete: cascade, so deleting users first would also work
    // -- but Organization has no FK to user to lean on, and this function's
    // contract is reverse-FK order, so both are listed explicitly.
    await db.delete(schema.orgMemberships);
    await db.delete(schema.organizations);
    await db.delete(schema.users);

    log('info', 'All tables cleared');
}

/**
 * Seed the database with users and issues
 */
export async function seedDatabase(issueTemplates: SeedIssueTemplate[]) {
    if (DRY_RUN) {
        log('info', 'DRY RUN MODE - No changes will be written');
        log('info', `Would create ${userTemplates.length} users and ${issueTemplates.length} issues`);
        log(
            'info',
            `Would create ${organizationTemplates.length} organizations and ${orgMembershipTemplates.length} memberships`,
        );
        return;
    }

    // 1. Create users
    log('info', 'Creating users...');
    const users = await createUsers(userTemplates);
    log('info', `  Inserted ${users.length} users`);

    // 2. Create organizations and their memberships. Independent of issues --
    // geo-matching joins the two by geometry, not by foreign key.
    log('info', 'Creating organizations...');
    const orgs = await createOrganizations(organizationTemplates);
    log('info', `  Inserted ${orgs.length} organizations`);

    log('info', 'Creating org memberships...');
    await createOrgMemberships(orgMembershipTemplates, users, orgs);

    // 3. Upload images and create issues
    log('info', 'Processing images and creating issues...');
    await createIssues(issueTemplates, users);

    // 4. Print summary
    await printSummary();
}

/**
 * Create pilot organizations.
 *
 * This deliberately does not go through OrgRepository.create -- that path still
 * carries a `TODO: add in geofence` and would produce orgs with a NULL geofence,
 * which findOrgsForIssue can never match.
 */
async function createOrganizations(orgTemplates: SeedOrgTemplate[]) {
    const orgs = [];

    for (const template of orgTemplates) {
        // `geofence` is geography(MultiPolygon,4326) behind an opaque customType
        // with no toDriver, so the value has to arrive as SQL rather than as a
        // bound string. Three things here break if changed:
        //
        // - ST_Multi is required. The column is MultiPolygon and a bare POLYGON
        //   is rejected with "Geometry type (Polygon) does not match column
        //   type (MultiPolygon)". ST_Multi promotes one polygon at no cost.
        // - It is ST_GeomFromText(wkt, 4326)::geography, not ST_GeogFromText --
        //   ST_Multi operates on geometry, so build the geometry and cast after.
        // - The insert stays in Drizzle rather than db.execute because `id` and
        //   `updatedAt` are client-generated ($defaultFn); a hand-written raw
        //   INSERT would have to supply both.
        const [org] = await db
            .insert(schema.organizations)
            .values({
                name: template.name,
                slug: template.slug,
                type: template.type,
                status: template.status,
                tier: template.tier,
                categoryScope: template.categoryScope,
                boundarySource: template.boundarySource,
                boundaryRef: template.boundaryRef,
                geofence: sql`ST_Multi(ST_GeomFromText(${template.geofenceWKT}, 4326))::geography`,
            })
            // Narrowed on purpose: the seed needs id/name/slug, and reading the
            // opaque geography column back is not something any repository does.
            .returning({
                id: schema.organizations.id,
                name: schema.organizations.name,
                slug: schema.organizations.slug,
            });

        log('info', `  Created org: ${org.name} (${org.slug})`);
        orgs.push(org);
    }

    return orgs;
}

/**
 * Attach seeded users to seeded orgs. Membership is what makes a responder --
 * see docs/design-decisions/responder-model.md.
 */
async function createOrgMemberships(
    templates: SeedOrgMembershipTemplate[],
    users: { id: string; email: string }[],
    orgs: { id: string; slug: string }[],
) {
    for (const template of templates) {
        const user = users.find((u) => u.email === template.userEmail);
        const org = orgs.find((o) => o.slug === template.orgSlug);

        // A typo in a fixture should fail loudly here rather than silently
        // seeding an org with no members and a Dispatch screen with no login.
        if (!user) throw new Error(`No seeded user for ${template.userEmail}`);
        if (!org) throw new Error(`No seeded org for ${template.orgSlug}`);

        await db.insert(schema.orgMemberships).values({
            userId: user.id,
            organizationId: org.id,
            role: template.role,
        });

        log('info', `  ${template.userEmail} -> ${template.orgSlug} (${template.role})`);
    }
}

/**
 * Create users in the database
 */
async function createUsers(userTemplates: SeedUserTemplate[]) {
    const users = [];

    for (const userTemplate of userTemplates) {
        // Check if user already exists
        const [existingUser] = await db
            .select()
            .from(schema.users)
            .where(eq(schema.users.email, userTemplate.email))
            .limit(1);

        if (existingUser) {
            log('warn', `User ${userTemplate.email} already exists, skipping`);
            users.push(existingUser);
            continue;
        }

        // Hash password
        const passwordHash = await bcrypt.hash(userTemplate.password, 10);

        // Create user
        const [user] = await db
            .insert(schema.users)
            .values({
                email: userTemplate.email,
                name: userTemplate.name,
                passwordHash,
                profilePhotoId: userTemplate.profilePhotoId || null,
            })
            .returning();

        log('info', `  Created user: ${user.email}`);
        users.push(user);
    }

    return users;
}

/**
 * Create issues with multiple images
 */
async function createIssues(
    issueTemplates: SeedIssueTemplate[],
    users: { id: string }[]
) {
    for (const template of issueTemplates) {
        // Pick a random user as the creator
        const randomUser = users[crypto.randomInt(users.length)];

        // Photos are inserted after the issue so they can carry issueId, so the
        // uploaded links are collected first. A placeholder is a link like any
        // other -- the row is what an id points at, which is why the previous
        // version pushing a placeholder URL into an id array could not work.
        const photoLinks: { url: string; publicId: string | null }[] = [];

        for (const imageFile of template.imageFiles) {
            const imagePath = path.join(IMAGES_DIR, imageFile);

            if (fs.existsSync(imagePath)) {
                try {
                    log('info', ` Uploading ${imageFile}...`);
                    const imageBuffer = fs.readFileSync(imagePath);
                    const imageUrl = await uploadImageToCloudinary(imageBuffer);
                    photoLinks.push({ url: imageUrl, publicId: null });
                    log('info', `   Uploaded: ${imageFile}`);
                } catch (error) {
                    log('warn', `  Failed to upload ${imageFile}: ${error}`);
                    // Use a placeholder URL if upload fails
                    photoLinks.push({
                        url: `https://placehold.co/600x400?text=${encodeURIComponent(template.category)}`,
                        publicId: null,
                    });
                }
            } else {
                log('warn', `  Image not found: ${imageFile}, using placeholder`);
                photoLinks.push({
                    url: `https://placehold.co/600x400?text=${encodeURIComponent(template.category)}`,
                    publicId: null,
                });
            }
        }

        // Create the issue
        const [issue] = await db
            .insert(schema.issues)
            .values({
                title: template.title,
                description: template.description,
                category: template.category,
                status: template.status,
                latitude: template.latitude,
                longitude: template.longitude,
                address: template.address,
                district: template.district || null,
                subregion: template.subregion || null,
                name: template.name || null,
                userId: randomUser.id,
            })
            .returning();

        if (photoLinks.length > 0) {
            await db.insert(schema.photos).values(
                photoLinks.map((photo, index) => ({
                    url: photo.url,
                    publicId: photo.publicId,
                    userId: randomUser.id,
                    issueId: issue.id,
                    position: index,
                    photoTakenAt: new Date(),
                    photoTakenAtSource: 'device' as const,
                })),
            );
        }

        await createRandomEndorsements(issue.id, randomUser.id, users);

        log('info', `  Created issue: ${issue.title} (${photoLinks.length} photos)`);
    }
}

async function createRandomEndorsements(
    issueId: string,
    creatorUserId: string,
    users: { id: string }[]
) {
    const eligibleUsers = users.filter((user) => user.id !== creatorUserId);
    const maxEndorsements = Math.min(30, eligibleUsers.length);

    if (maxEndorsements === 0) {
        return;
    }

    const endorsementCount = crypto.randomInt(1, maxEndorsements + 1);
    const shuffledUsers = [...eligibleUsers].sort(() => Math.random() - 0.5);
    const selectedUsers = shuffledUsers.slice(0, endorsementCount);

    await db.insert(schema.upvotes).values(
        selectedUsers.map((user) => ({
            issueId,
            userId: user.id,
        })),
    );

    log('info', `   Added ${endorsementCount} endorsements`);
}

/**
 * Print summary of seeded data
 */
async function printSummary() {
    const [{ value: userCount }] = await db.select({ value: count() }).from(schema.users);
    const [{ value: issueCount }] = await db.select({ value: count() }).from(schema.issues);
    const [{ value: upvoteCount }] = await db.select({ value: count() }).from(schema.upvotes);
    const [{ value: orgCount }] = await db.select({ value: count() }).from(schema.organizations);
    const [{ value: membershipCount }] = await db
        .select({ value: count() })
        .from(schema.orgMemberships);

    // Count by category
    const categoryCounts = await db
        .select({ category: schema.issues.category, total: count() })
        .from(schema.issues)
        .groupBy(schema.issues.category);

    // Count by status
    const statusCounts = await db
        .select({ status: schema.issues.status, total: count() })
        .from(schema.issues)
        .groupBy(schema.issues.status);

    log('info', 'Seed complete', {
        users: userCount,
        issues: issueCount,
        endorsements: upvoteCount,
        organizations: orgCount,
        orgMemberships: membershipCount,
        byCategory: Object.fromEntries(categoryCounts.map(c => [c.category, c.total])),
        byStatus: Object.fromEntries(statusCounts.map(s => [s.status, s.total])),
    });
}
