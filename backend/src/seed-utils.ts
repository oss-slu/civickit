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

import prisma from './prisma.js';
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
 * Clean all data from the database (issues, comments, upvotes, events, users)
 * Deletes in reverse FK order to respect foreign key constraints
 */
export async function cleanupDatabase() {
    if (DRY_RUN) {
        log('info', 'DRY RUN: Would delete all rows');
        return;
    }

    log('info', 'Deleting all rows...');

    // Delete in reverse FK order
    await prisma.upvote.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.eventRsvp.deleteMany();
    await prisma.event.deleteMany();
    await prisma.issue.deleteMany();
    await prisma.user.deleteMany();

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
        const existingUser = await prisma.user.findUnique({
            where: { email: userTemplate.email },
        });

        if (existingUser) {
            log('warn', `User ${userTemplate.email} already exists, skipping`);
            users.push(existingUser);
            continue;
        }

        // Hash password
        const passwordHash = await bcrypt.hash(userTemplate.password, 10);

        // Create user
        const user = await prisma.user.create({
            data: {
                email: userTemplate.email,
                name: userTemplate.name,
                passwordHash,
                profileImage: userTemplate.profileImage || null,
            },
        });

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

        // Upload all images for this issue
        const imageUrls: string[] = [];

        for (const imageFile of template.imageFiles) {
            const imagePath = path.join(IMAGES_DIR, imageFile);

            if (fs.existsSync(imagePath)) {
                try {
                    log('info', `  📤 Uploading ${imageFile}...`);
                    const imageBuffer = fs.readFileSync(imagePath);
                    const imageUrl = await uploadImageToCloudinary(imageBuffer);
                    imageUrls.push(imageUrl);
                    log('info', `  ✅ Uploaded: ${imageFile}`);
                } catch (error) {
                    log('warn', `  Failed to upload ${imageFile}: ${error}`);
                    // Use a placeholder URL if upload fails
                    imageUrls.push(`https://placehold.co/600x400?text=${encodeURIComponent(template.category)}`);
                }
            } else {
                log('warn', `  Image not found: ${imageFile}, using placeholder`);
                imageUrls.push(`https://placehold.co/600x400?text=${encodeURIComponent(template.category)}`);
            }
        }

        // Create the issue
        const issue = await prisma.issue.create({
            data: {
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
                images: imageUrls,
                userId: randomUser.id,
            },
        });

        log('info', `  ✅ Created issue: ${issue.title} (${imageUrls.length} images)`);
    }
}

/**
 * Print summary of seeded data
 */
async function printSummary() {
    const userCount = await prisma.user.count();
    const issueCount = await prisma.issue.count();

    // Count by category
    const categoryCounts = await prisma.issue.groupBy({
        by: ['category'],
        _count: true,
    });

    // Count by status
    const statusCounts = await prisma.issue.groupBy({
        by: ['status'],
        _count: true,
    });

    log('info', 'Seed complete', {
        users: userCount,
        issues: issueCount,
        byCategory: Object.fromEntries(categoryCounts.map(c => [c.category, c._count])),
        byStatus: Object.fromEntries(statusCounts.map(s => [s.status, s._count])),
    });
}