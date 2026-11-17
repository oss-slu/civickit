// filepath: backend/src/seed-data.ts
/**
 * Seed Data Templates
 * 
 * This file contains the issue templates for seeding the database.
 * Each template includes location data from St. Louis, MO (Midtown area).
 * 
 * Categories: POTHOLE, STREETLIGHT, GRAFFITI, ILLEGAL_DUMPING, 
 *             BROKEN_SIDEWALK, TRAFFIC_SIGNAL, OTHER
 * 
 * Statuses: REPORTED, ACKNOWLEDGED, IN_PROGRESS, RESOLVED, 
 *           COMMUNITY_RESOLVED, CLOSED
 */

import {
    BoundarySource,
    IssueCategory,
    IssueStatus,
    OrgRole,
    OrgStatus,
    OrgTier,
    OrgType,
} from '@civickit/shared';
import type { Role } from './db/schema.js';

export interface SeedIssueTemplate {
    title: string;
    description: string;
    category: IssueCategory;
    status: IssueStatus;
    latitude: number;
    longitude: number;
    address: string;
    district?: string;
    subregion?: string;
    name?: string;
    imageFiles: string[];  // Array of image filenames in images folder; empty seeds one placeholder
    // Fixed creator. Unset picks a random background user.
    reporterEmail?: string;
    // Always endorse this issue, on top of the random background endorsements.
    endorsedBy?: string[];
}

export interface SeedUserTemplate {
    email: string;
    name: string;
    password: string;
    // Platform role. Defaults to REPORTER, as on the column.
    role?: Role;
    profilePhotoId?: string;
}

export interface SeedOrgTemplate {
    name: string;
    slug: string;
    type: OrgType;
    status: OrgStatus;
    tier: OrgTier;
    categoryScope: IssueCategory[];
    boundarySource: BoundarySource;
    boundaryRef: string | null;
    // Plain WKT here; seed-utils turns it into geography(MultiPolygon,4326).
    geofenceWKT: string;
}

export interface SeedOrgMembershipTemplate {
    userEmail: string;
    orgSlug: string;
    role: OrgRole;
}

export const SEED_PASSWORD = 'password123';

// One login per role, named for what it is. Everything the docs tell you to log
// in as is here; docs/SETUP.md has the table. These accounts never get random
// issues or endorsements, so what each one sees is the same on every seed.
export const SEED_ACCOUNTS = {
    // Plain reporter, no org. Owns and endorses the issues marked below.
    reporter: 'reporter@example.com',
    // Midtown CID (org A).
    orgAdmin: 'orgadmin@example.com',
    orgMember: 'orgmember@example.com',
    // Southside Neighbors (org B), for cross-org 403s.
    otherOrg: 'otherorg@example.com',
    // User.role = ADMIN, no org.
    admin: 'admin@example.com',
} as const;

export const ORG_A_SLUG = 'midtown-cid';
export const ORG_B_SLUG = 'southside-neighbors';

const testAccountTemplates: SeedUserTemplate[] = [
    { email: SEED_ACCOUNTS.reporter, name: 'Riley Reporter', password: SEED_PASSWORD },
    { email: SEED_ACCOUNTS.orgAdmin, name: 'Morgan Midtown (Org Admin)', password: SEED_PASSWORD },
    { email: SEED_ACCOUNTS.orgMember, name: 'Jordan Midtown (Org Member)', password: SEED_PASSWORD },
    { email: SEED_ACCOUNTS.otherOrg, name: 'Sam Southside (Org Member)', password: SEED_PASSWORD },
    { email: SEED_ACCOUNTS.admin, name: 'Avery Admin', password: SEED_PASSWORD, role: 'ADMIN' },
];

export const testAccountEmails: ReadonlySet<string> = new Set(Object.values(SEED_ACCOUNTS));

// Background reporters: random issue creators and endorsers, so the feed looks
// lived in. None belongs to an org.
const baseUserTemplates: SeedUserTemplate[] = [
    {
        email: 'alice@example.com',
        name: 'Alice Johnson',
        password: SEED_PASSWORD,
    },
    {
        email: 'bob@example.com',
        name: 'Bob Smith',
        password: SEED_PASSWORD,
    },
    {
        email: 'carol@example.com',
        name: 'Carol Williams',
        password: SEED_PASSWORD,
    },
    {
        email: 'david@example.com',
        name: 'David Brown',
        password: SEED_PASSWORD,
    },
    {
        email: 'emma@example.com',
        name: 'Emma Davis',
        password: SEED_PASSWORD,
    },
];

const generatedUserNames = [
    'Frank Miller',
    'Grace Wilson',
    'Henry Moore',
    'Isabella Taylor',
    'Jack Anderson',
    'Katherine Thomas',
    'Liam Jackson',
    'Mia White',
    'Noah Harris',
    'Olivia Martin',
    'Paul Thompson',
    'Quinn Garcia',
    'Ruby Martinez',
    'Samuel Robinson',
    'Tara Clark',
    'Uma Rodriguez',
    'Victor Lewis',
    'Willow Lee',
    'Xavier Walker',
    'Yara Hall',
    'Zane Allen',
    'Ava Young',
    'Benjamin King',
    'Chloe Wright',
    'Daniel Scott',
    'Ella Green',
    'Finn Baker',
    'Gianna Adams',
    'Hudson Nelson',
    'Ivy Carter',
    'Julian Mitchell',
    'Luna Perez',
    'Miles Roberts',
    'Nora Turner',
    'Owen Phillips',
];

// Sample users for seeding
export const userTemplates: SeedUserTemplate[] = [
    ...testAccountTemplates,
    ...baseUserTemplates,
    ...generatedUserNames.map((name) => ({
        email: `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
        name,
        password: SEED_PASSWORD,
    })),
];

// Pilot organizations. Stand-in for the self-serve registration wizard, which
// is deferred past Demo Day -- without these there is no responder to log in as
// and the org branches of requirePermission are unreachable outside the tests.
//
// Two orgs that do not overlap in area or scope, so each can be tested against
// the other. seed.integration.test.ts checks the counts in these comments.
export const organizationTemplates: SeedOrgTemplate[] = [
    {
        // Org A.
        name: 'Midtown CID',
        slug: ORG_A_SLUG,
        type: 'CID',
        status: 'ACTIVE',
        tier: 'GROWTH',
        // Covers 11 of the 12 Midtown issues. GRAFFITI is left to org B.
        // ILLEGAL_DUMPING is left out so at least one in-geofence issue is
        // provably out of scope, which is what proves the filter works.
        categoryScope: ['BROKEN_SIDEWALK', 'STREETLIGHT', 'TRAFFIC_SIGNAL', 'POTHOLE'],
        boundarySource: 'FREEHAND',
        // FREEHAND boundaries have no upstream source, so boundaryRef stays
        // null. A seeded OFFICIAL org would set it to something like
        // 'stl-open-data:wards-2023:ward-7' plus a boundarySyncedAt timestamp.
        boundaryRef: null,
        // Bounding box lat 38.6300..38.6750, lng -90.2450..-90.1990. All twelve
        // Midtown issues fall inside; the two Tower Grove South issues do not.
        // WKT is lng-then-lat, and the ring must close on its first point.
        geofenceWKT:
            'POLYGON((-90.2450 38.6300, -90.1990 38.6300, -90.1990 38.6750, -90.2450 38.6750, -90.2450 38.6300))',
    },
    {
        // Org B. Small on purpose: one member, two issues.
        name: 'Southside Neighbors',
        slug: ORG_B_SLUG,
        type: 'NONPROFIT',
        status: 'ACTIVE',
        tier: 'STARTER',
        // Disjoint from org A's scope. The Midtown ILLEGAL_DUMPING issue is in
        // scope here but outside this geofence, so it proves the geofence
        // filter the way org A's scope proves the category one.
        categoryScope: ['GRAFFITI', 'ILLEGAL_DUMPING'],
        boundarySource: 'FREEHAND',
        boundaryRef: null,
        // Bounding box lat 38.5850..38.6000, lng -90.2720..-90.2440, Tower Grove
        // South. Contains both Tower Grove South issues and no Midtown ones.
        geofenceWKT:
            'POLYGON((-90.2720 38.5850, -90.2440 38.5850, -90.2440 38.6000, -90.2720 38.6000, -90.2720 38.5850))',
    },
];

// Two members of org A on purpose. Issue.claimedById holds a *user* id and
// authorization resolves the org through that user's membership, so a single
// member can only demonstrate "the claimer can act on it". A second member is
// what exercises the real rule -- any member of the claiming org may post
// updates and change status, which is why isResponder() accepts both roles.
//
// Org B's member is the outsider: same role as orgmember@, wrong org.
export const orgMembershipTemplates: SeedOrgMembershipTemplate[] = [
    { userEmail: SEED_ACCOUNTS.orgAdmin, orgSlug: ORG_A_SLUG, role: 'ORG_ADMIN' },
    { userEmail: SEED_ACCOUNTS.orgMember, orgSlug: ORG_A_SLUG, role: 'ORG_MEMBER' },
    { userEmail: SEED_ACCOUNTS.otherOrg, orgSlug: ORG_B_SLUG, role: 'ORG_MEMBER' },
];

// Issue templates with real St. Louis location data
// Photos taken in Midtown St. Louis area
export const issueTemplates: SeedIssueTemplate[] = [
    {
        title: 'Unwalkable sidewalk',
        description: 'Broken sidewalk panels completely broken and shifted, creating a trip hazard for pedestrians. Several near-miss accidents reported.',
        category: 'BROKEN_SIDEWALK',
        status: 'REPORTED',
        latitude: 38.63965,
        longitude: -90.23581,
        address: 'Olive St & N Spring Ave, St. Louis, MO',
        district: 'Midtown',
        subregion: 'Midtown',
        name: 'Olive & N Spring Ave',
        imageFiles: ['IMG_1528.jpg'],
        // In org A's geofence and scope, unclaimed: the issue to claim, update
        // and change status on in docs/testing-instructions.md.
        reporterEmail: SEED_ACCOUNTS.reporter,
    },
    {
        title: 'Broken sidewalk on Delmar Blvd',
        description: 'Sidewalk panels completely broken and shifted, creating a trip hazard for pedestrians. Several near-miss accidents reported.',
        category: 'BROKEN_SIDEWALK',
        status: 'REPORTED',
        latitude: 38.6598,
        longitude: -90.2045,
        address: 'Delmar Blvd, St. Louis, MO',
        district: 'Midtown',
        subregion: 'Delmar Loop',
        name: 'Near 5400 Delmar Blvd',
        imageFiles: ['IMG_1529.jpg', 'IMG_1530.jpg'],
    },
    {
        title: 'Vandalism on electrical box',
        description: 'Wires exposed and box damaged due to vandalism. Potential safety hazard for pedestrians and nearby residents.',
        category: 'TRAFFIC_SIGNAL',
        status: 'REPORTED',
        latitude: 38.63441,
        longitude: -90.24235,
        address: 'S Vandeventer Ave, St. Louis, MO',
        district: 'Midtown',
        subregion: 'Midtown',
        name: 'Near Ikea and the Marshall',
        imageFiles: ['IMG_1539.jpg', 'IMG_1540.jpg'],
    },
    {
        title: 'Poor sidewalk condition',
        description: 'Sidewalk is in poor condition with large cracks and uneven surfaces. Difficult for wheelchair users and parents with strollers to navigate.',
        category: 'BROKEN_SIDEWALK',
        status: 'REPORTED',
        latitude: 38.63167,
        longitude: -90.22727,
        address: 'S Compton Ave, St. Louis, MO',
        district: 'Midtown',
        subregion: 'Midtown',
        name: 'Near Chaifetz Arena',
        imageFiles: ['IMG_1540.jpg'],
    },
    {
        title: 'Broken pipe at sidewalk construction site',
        description: 'Construction site has been abandoned with a broken water pipe causing flooding on the sidewalk. Hazardous for pedestrians and cyclists.',
        category: 'BROKEN_SIDEWALK',
        status: 'IN_PROGRESS',
        latitude: 38.63295,
        longitude: -90.23445,
        address: 'Grand Blvd & Forest Park Ave, St. Louis, MO',
        district: 'Midtown',
        subregion: 'Midtown',
        name: 'Near Reinert Hall',
        imageFiles: ['IMG_1556.jpg', 'IMG_1557.jpg'],
    },
    {
        title: 'Traffic signal malfunction at intersection',
        description: 'Traffic light at this intersection has been flashing red for several days. Very confusing for drivers and pedestrians.',
        category: 'TRAFFIC_SIGNAL',
        status: 'ACKNOWLEDGED',
        latitude: 38.6512,
        longitude: -90.2045,
        address: 'Grand Blvd & Lindell Blvd, St. Louis, MO',
        district: 'Midtown',
        subregion: 'Grand Center',
        name: 'Grand & Lindell',
        imageFiles: ['IMG_1558.jpg'],
        endorsedBy: [SEED_ACCOUNTS.reporter],
    },
    {
        title: 'Large chip in sidewalk',
        description: 'Large chip in the sidewalk creating a tripping hazard. Located near a popular bus stop, so many pedestrians are affected.',
        category: 'BROKEN_SIDEWALK',
        status: 'REPORTED',
        latitude: 38.63391,
        longitude: -90.23386,
        address: 'S Grand Blvd, St. Louis, MO',
        district: 'Midtown',
        subregion: 'Midtown',
        name: 'Near S Grand Circle K',
        imageFiles: ['IMG_1559.jpg'],
    },
    {
        title: 'Street light flickering on Washington Ave',
        description: 'Street light flickers on and off constantly, disturbing residents and creating safety issues.',
        category: 'STREETLIGHT',
        status: 'REPORTED',
        latitude: 38.6423,
        longitude: -90.2089,
        address: 'Washington Ave, St. Louis, MO',
        district: 'Midtown',
        subregion: 'Washington Ave Corridor',
        name: 'Near 1500 Washington Ave',
        imageFiles: ['IMG_1560.jpg'],
        endorsedBy: [SEED_ACCOUNTS.reporter],
    },
    {
        title: 'Streetlight ran over by car',
        description: 'Streetlight was hit by a car and is out of commission. Exposed wires are a safety hazard for pedestrians.',
        category: 'STREETLIGHT',
        status: 'RESOLVED',
        latitude: 38.63116,
        longitude: -90.22121,
        address: 'Market St, St. Louis, MO',
        district: 'Midtown',
        subregion: 'Midtown',
        name: 'Near Wells Fargo Bank',
        imageFiles: ['IMG_1562.jpg', 'IMG_1563.jpg', 'IMG_1564.jpg'],
    },
    {
        title: 'Abandoned items in alleyway',
        description: 'Various items abandoned in the alleyway, including furniture and debris. Creating blight in the neighborhood.',
        category: 'ILLEGAL_DUMPING',
        status: 'REPORTED',
        latitude: 38.6445,
        longitude: -90.2012,
        address: 'Spring Ave, St. Louis, MO',
        district: 'Midtown',
        subregion: 'Soulard',
        name: 'Near 1800 Spring Ave',
        imageFiles: ['IMG_1564.jpg', 'IMG_1565.jpg'],
        // In org A's geofence, out of its scope; in org B's scope, out of its
        // geofence. No org can see it in Dispatch.
        reporterEmail: SEED_ACCOUNTS.reporter,
    },
    {
        title: 'Road damage on Natural Bridge Rd',
        description: 'Road surface has cracked significantly due to water damage. Growing larger each week.',
        category: 'POTHOLE',
        status: 'REPORTED',
        latitude: 38.6712,
        longitude: -90.2134,
        address: 'Natural Bridge Rd, St. Louis, MO',
        district: 'North',
        subregion: 'Fairground',
        name: 'Near 4300 Natural Bridge Rd',
        imageFiles: ['IMG_1566.jpg'],
    },
    {
        title: 'Damaged sidewalk near metro station',
        description: 'Sidewalk near the metro station is severely damaged, creating hazards for transit users.',
        category: 'BROKEN_SIDEWALK',
        status: 'ACKNOWLEDGED',
        latitude: 38.6389,
        longitude: -90.2056,
        address: 'Convention Center Dr, St. Louis, MO',
        district: 'Downtown',
        subregion: 'Convention Center',
        name: 'Near 600 Convention Center Dr',
        imageFiles: ['IMG_1567.jpg'],
    },
    // Tower Grove South: inside org B's geofence and scope, outside org A's
    // geofence. About 3 miles from Midtown, so they still show in the 5 mile
    // nearby feed from the Midtown dev location.
    {
        title: 'Graffiti on storefront shutter',
        description: 'Fresh tags across a roll-down shutter and the brick beside it. Third time this month.',
        category: 'GRAFFITI',
        status: 'REPORTED',
        latitude: 38.5930,
        longitude: -90.2588,
        address: 'Morgan Ford Rd, St. Louis, MO',
        district: 'South City',
        subregion: 'Tower Grove South',
        name: 'Near 3400 Morgan Ford Rd',
        imageFiles: [],
        reporterEmail: SEED_ACCOUNTS.reporter,
    },
    {
        title: 'Mattress dumped in alley',
        description: 'Mattress and a broken dresser left in the alley behind Arsenal St. Blocking the trash bins.',
        category: 'ILLEGAL_DUMPING',
        status: 'REPORTED',
        latitude: 38.5978,
        longitude: -90.2532,
        address: 'Arsenal St, St. Louis, MO',
        district: 'South City',
        subregion: 'Tower Grove South',
        name: 'Alley off Arsenal St',
        imageFiles: [],
    },
];

// Helper to get random item from array
export function getRandomItem<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
}

// Helper to get random items from array
export function getRandomItems<T>(array: T[], count: number): T[] {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}
