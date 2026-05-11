// filepath: backend/src/seed.ts
/**
 * CivicKit Database Seed Script
 * 
 * Populates the PostgreSQL database with hand-crafted fixture data.
 * Safe to run multiple times (deletes and re-inserts).
 * 
 * Usage:
 *   npx tsx src/seed.ts                  # Dry-run (preview only)
 *   npx tsx src/seed.ts run              # Write to database
 *   npx tsx src/seed.ts clean            # Clean database
 *   npx tsx src/seed.ts reset            # Clean and re-seed
 *   npx tsx src/seed.ts help             # Show help
 * 
 * From project root:
 *   npm run seed:run                     # Seed the database
 *   npm run seed:clean                   # Clean the database
 *   npm run seed:reset                   # Reset and re-seed
 */

import "dotenv/config";
import { seedDatabase, cleanupDatabase } from './seed-utils.js';
import { issueTemplates, userTemplates } from './seed-data.js';

// Logging utility
function log(level: 'info' | 'warn' | 'error', message: string, data?: unknown) {
    const ts = new Date().toISOString();
    const prefix = `[${ts}] [${level.toUpperCase()}]`;
    if (data !== undefined) {
        if (data instanceof Error) {
            console.log(prefix, message, data.message, data.stack);
        } else {
            console.log(prefix, message, JSON.stringify(data, null, 2));
        }
    } else {
        console.log(prefix, message);
    }
}

// Check for dry-run mode
const DRY_RUN = process.argv.includes('--dry-run');

async function main() {
    const args = process.argv.slice(2);
    const command = args[0];

    console.log('\n CivicKit Seed Script\n');
    console.log('─'.repeat(50));

    if (DRY_RUN) {
        log('info', 'DRY RUN MODE - No changes will be written');
        log('info', 'Use "run" command to write to database');
    }

    try {
        switch (command) {
            case 'clean':
                log('info', 'Cleaning database...');
                await cleanupDatabase();
                log('info', 'Database cleaned successfully');
                break;

            case 'reset':
                log('info', 'Resetting database (clean + seed)...');
                await cleanupDatabase();
                await seedDatabase(issueTemplates);
                log('info', 'Database reset complete');
                break;

            case 'run':
            case undefined:
                log('info', 'Seeding database...');
                await seedDatabase(issueTemplates);
                log('info', 'Database seeded successfully');
                break;

            case 'help':
            default:
                printHelp();
        }
    } catch (error) {
        log('error', 'Seed failed', error as Error);
        process.exit(1);
    }
}

function printHelp() {
    console.log(`
Usage: npx tsx src/seed.ts [command]

Commands:
  run      Seed the database with sample issues (default)
  clean    Clean all issues and users from the database
  reset    Clean and re-seed the database
  help     Show this help message

Options:
  --dry-run  Preview what would be seeded without writing

Examples:
  npx tsx src/seed.ts              # Seed the database
  npx tsx src/seed.ts --dry-run     # Preview without writing
  npx tsx src/seed.ts clean        # Clean the database
  npx tsx src/seed.ts reset        # Reset and re-seed

Data:
  Users:    ${userTemplates.length} (password: password123)
  Issues:   ${issueTemplates.length}
  Location: St. Louis, MO (Midtown area)
  `);
}

main();