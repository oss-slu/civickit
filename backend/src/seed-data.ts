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

import { IssueCategory, IssueStatus } from '@civickit/shared';

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
    imageFiles: string[];  // Array of image filenames in images folder
}

export interface SeedUserTemplate {
    email: string;
    name: string;
    password: string;
    profileImage?: string;
}

const baseUserTemplates: SeedUserTemplate[] = [
    {
        email: 'alice@example.com',
        name: 'Alice Johnson',
        password: 'password123',
    },
    {
        email: 'bob@example.com',
        name: 'Bob Smith',
        password: 'password123',
    },
    {
        email: 'carol@example.com',
        name: 'Carol Williams',
        password: 'password123',
    },
    {
        email: 'david@example.com',
        name: 'David Brown',
        password: 'password123',
    },
    {
        email: 'emma@example.com',
        name: 'Emma Davis',
        password: 'password123',
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
    ...baseUserTemplates,
    ...generatedUserNames.map((name) => ({
        email: `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
        name,
        password: 'password123',
    })),
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
