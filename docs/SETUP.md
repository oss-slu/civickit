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

## Backend Setup
1. Clone repo
2. `cd backend`
3. `cp .env.example .env` (copy `.env.example` to `.env`) then fill in values
4. `npm install`
5. `npm run db:setup` (starts the docker container and applies migrations)
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
1. Seed the database (above), or browse/edit data with `npm run db:studio`
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

### Database and migrations
The backend uses [Drizzle](https://orm.drizzle.team). The schema lives in
`backend/src/db/schema.ts` and is the source of truth.

To change it: edit `schema.ts`, then `npm run db:generate` to write a migration
into `backend/drizzle/`, then `npm run db:migrate` to apply it. Review the
generated SQL before committing it.

`drizzle/extensions.sql` holds the PostGIS `CREATE EXTENSION` statements.
drizzle-kit cannot generate those from a schema file, so `db:migrate` applies
that file before the migrations. Do not move its contents into a generated
migration — the next `db:generate` would drop them, and the nearby-issues
endpoint fails without PostGIS.

> **Upgrading an existing checkout:** this replaced Prisma, and the migration
> history was restarted. A database created before that change cannot be
> migrated forward — `db:migrate` fails on types and tables that already exist.
> Recreate it, then re-seed:
>
> ```bash
> npm run db:reset && npm run seed:run
> ```
>
> Any local data is lost. Note that `db:down` alone is **not** enough: it keeps
> the `civickit-data` volume, so the old schema survives. `db:reset` calls
> `db:nuke` (`docker compose down -v`), which removes it.

### Running backend tests
```bash
npm test              # unit tests, no database needed
npm run test:integration   # runs SQL against a real database
```
The integration tests need the database container up (`npm run db:up`). They
create and manage their own `civickit_test` database, drop its schema on every
run, and truncate between cases — so they refuse to start if `TEST_DATABASE_URL`
resolves to the same database as `DATABASE_URL`. Override it via
`.env.test.local` (see `backend/.env.test.example`) if the default collides.

These are the only tests that execute SQL; the unit tests mock the repositories.

## Mobile Setup
The app derives the backend address from whichever address Metro is served on —
the same machine that runs the backend — so testing on a physical phone needs no
IP configuration. To point it somewhere else, such as a deployed backend, set
`EXPO_PUBLIC_API_URL` (see `mobile/.env.example`).

1. From the `mobile/` directory
```bash
cd mobile
npm install
```
2. In the `mobile/` directory, start Metro:
```bash
npm start
```

* Press `i` to open iOS simulator (macOS only)
* Press `a` to open Android emulator
* Press `w` to run in the browser (web)

3. Then scan the QR code using the Camera app (iOS) or Expo Go (Android). Expo
Go must be installed on the device. From Windows you may need production mode:
```bash
npx expo start --no-dev --minify
```

### When the phone can't reach your laptop

`npm start` needs the phone and the laptop on the same wifi, with
client-to-client traffic allowed. It fails when you are on cellular data, or on
guest/"sandboxed" wifi that isolates clients from each other. The symptom is the
app loading but every request failing.

Use Tailscale instead. It puts the phone and the laptop on a private network of
your own, so they reach each other regardless of the wifi in between — including
networks that block direct traffic, where it relays over port 443.

1. Install Tailscale on the laptop and the phone, signed into the same account.
2. Start the backend as usual: `cd backend && npm run dev`
3. Start Metro bound to the Tailscale address:
```bash
cd mobile
npm run start:tailscale
```

That is the whole setup. Metro is served from the laptop's Tailscale address, so
the app derives the backend from it automatically — nothing to configure, and no
URL to re-paste, because the address never changes.

On Windows the npm script's shell syntax will not run; use:
```
set REACT_NATIVE_PACKAGER_HOSTNAME=<your tailscale ip> && npx expo start
```

Image uploads go from the phone straight to Cloudinary, so they keep working on
cellular either way.

## Web Setup
```bash
cd web
npm install
npm run dev
```
* `npm run build` builds for production
* `npm run deploy` builds and deploys to Cloudflare Workers (requires Wrangler access)
* `npm run check` formats and lints
