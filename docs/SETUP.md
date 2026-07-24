Last updated 7/21/2026
# Development Setup

## Prerequisites
- Node.js 20+ (matches CI)
- Docker (runs the PostgreSQL 15 + PostGIS database)
- Git
- A free [Cloudinary](https://cloudinary.com) account (needed for image upload and database seeding)

### Backend .env Example
```bash
PG_USER=postgres
DATABASE_URL="postgresql://postgres:password@localhost:5432/civickit"
JWT_SECRET="your-super-secret-jwt-key-change-this"
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
PORT=3000
```
Notes:
- `JWT_SECRET` must be at least 16 characters or the server refuses to start.
- The `CLOUDINARY_*` values come from your Cloudinary dashboard. The server starts without them, but image upload and seeding will fail until they are filled in.

## Quick Start (all projects)
From the repository root:
```bash
npm install       # root task runner only
npm run setup     # installs every project, creates backend/.env, starts the database
npm run dev       # database + backend + mobile + web in one terminal
```
Fill in the `CLOUDINARY_*` values in `backend/.env` before uploading images or seeding.

| command | what it does |
|---|---|
| `npm run dev` | database + backend + mobile + web |
| `npm run dev:services` | database + backend + web only |
| `npm run dev:backend` / `dev:mobile` / `dev:web` | one project on its own |
| `npm run db:up` / `db:down` / `db:studio` | database container and Prisma Studio |
| `npm run seed` / `seed:reset` | sample data |
| `npm test` | tests across all projects |
| `npm run typecheck` | typecheck across all projects |

Two caveats worth knowing:
- Under `npm run dev`, Expo is not attached to an interactive terminal, so its keyboard
  shortcuts (`i`, `a`, `r`) do nothing. The QR code and logs work normally. For the
  shortcuts, run `npm run dev:services` in one terminal and `npm run dev:mobile` in another.
- `npm run typecheck` includes `web`, which needs `web/src/routeTree.gen.ts`. That file is
  generated and gitignored, so on a fresh clone run `npm run dev:web` (or `cd web && npm run build`)
  once before typechecking.

The sections below cover each project individually, which is still the right path if you
only want to work on one of them.

## Backend Setup
1. Clone repo
2. `cd backend`
3. `cp .env.example .env` (copy `.env.example` to `.env`) then fill in values
4. `npm install`
5. `npm run db:setup` (starts docker container, pushes schema and generates client)
6. `npm run dev` (start the backend)
7. Server runs on http://localhost:3000

### Seeding the database
*Preview what would be seeded*
npm run seed:preview

*Seed the database*
npm run seed:run

*Clean database*
npm run seed:clean

*Reset (clean + seed)*
npm run seed:reset

Seeding creates 40 users and ~24 issues around Midtown St. Louis (photos are uploaded to your Cloudinary account). All seeded users share the password `password123` — e.g. log in as `alice@example.com` to test with an account that already has issues and endorsements.

### Testing Backend API
1. Seed the database (above), or browse/edit data with `npx prisma studio`
2. Get nearby issues: `curl "http://localhost:3000/api/issues/nearby?lat=38.635&lng=-90.23&radius=5000"`
3. Get issue by id: `curl http://localhost:3000/api/issues/<issue-id>`
4. Creating an issue requires auth: log in first and pass the token
```bash
curl -X POST http://localhost:3000/api/auth/login \
-H "Content-Type: application/json" \
-d '{"email": "alice@example.com", "password": "password123"}'
# then use the returned token:
curl -X POST http://localhost:3000/api/issues \
-H "Content-Type: application/json" \
-H "Authorization: Bearer <token>" \
-d '{
  "title": "Broken sidewalk",
  "description": "Cracked pavement near campus",
  "category": "BROKEN_SIDEWALK",
  "latitude": 38.6352,
  "longitude": -90.2318,
  "images": []
}'
```

## Mobile Setup
The app reads the backend address from `mobile/src/config/env.local.json`. This file is gitignored — it is generated for you by the start scripts below, so always use them the first time.

1. From the `mobile/` directory
```bash
cd mobile
npm install
```
2. In the `mobile/` directory, choose `startWin.sh` for Windows or `startMac.sh` for Mac
   1. In a bash terminal, set permissions with `chmod +x startWin.sh` or `chmod +x startMac.sh` (You only need to do this once)
   2. To start using your IPv4 address as the domain (necessary to test on a physical phone), run `./startWin.sh ip` or `./startMac.sh ip`
   3. To start on localhost (fine for simulators/emulators), run `./startWin.sh localhost` or `./startMac.sh localhost`

* Press `i` to open iOS simulator (macOS only)
* Press `a` to open Android emulator
* Press `w` to run in the browser (web)

To run on a physical device: start with the `ip` option (phone and computer must be on the same Wi-Fi network), then scan the QR code using the Camera app (iOS) or Expo Go (Android). Expo Go must be installed on the device. From Windows you may need production mode:
```bash
npx expo start --no-dev --minify
```

If the app loads but fails to fetch (common on networks that block device-to-device traffic), proxy the backend through Cloudflare:
1. ensure dependencies are up to date in backend `npm install`
2. in `backend/` run `npm run dev`
3. in `backend/` run `npm run dev:proxy` which generates a public trycloudflare.com link. Put that link (with `/api` appended) as the dev `apiUrl` in `mobile/src/config/env.ts`
4. in `mobile/` run `npx expo start --tunnel`

## Web Setup
```bash
cd web
npm install
npm run dev
```
* `npm run build` builds for production
* `npm run deploy` builds and deploys to Cloudflare Workers (requires Wrangler access)
* `npm run check` formats and lints
