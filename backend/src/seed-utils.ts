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

import { count, eq } from 'drizzle-orm';
import db from './db/index.js';
import * as schema from './db/schema.js';
import { userTemplates, type SeedIssueTemplate, type SeedUserTemplate } from './seed-data.js';
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
 * Clean all data from the database (issues, timeline entries, upvotes, events, users)
 * Deletes in reverse FK order to respect foreign key constraints
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
        return;
    }

    // 1. Create users
    log('info', 'Creating users...');
    const users = await createUsers(userTemplates);
    log('info', `  Inserted ${users.length} users`);

    // 2. Upload images and create issues
    log('info', 'Processing images and creating issues...');
    await createIssues(issueTemplates, users);

    // 3. Print summary
    await printSummary();
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
        byCategory: Object.fromEntries(categoryCounts.map(c => [c.category, c.total])),
        byStatus: Object.fromEntries(statusCounts.map(s => [s.status, s.total])),
    });
}
