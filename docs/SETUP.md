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

`seed:reset` and `seed:clean` **delete every row**, including accounts you
registered by hand. The seed refuses to run when `NODE_ENV=production` or when
`DATABASE_URL` is not a local host (`localhost`, `127.0.0.1`, `db`). To seed a
disposable remote database anyway, set `SEED_ALLOW_REMOTE_DB=true`.

What gets seeded:

- **45 users**: five test accounts (below) and 40 background reporters
  (`alice@`, `bob@`, ... `owen.phillips@example.com`) who create and endorse
  issues at random. Background users belong to no org.
- **14 issues**: 12 in Midtown, 2 in Tower Grove South. Photos are uploaded to
  your Cloudinary account, or replaced by placeholders if that fails.
- **2 organizations**:
  - **Midtown CID** (org A): geofence over Midtown, scope `BROKEN_SIDEWALK`,
    `STREETLIGHT`, `TRAFFIC_SIGNAL`, `POTHOLE`. 12 issues in its geofence, 11
    in scope (the `ILLEGAL_DUMPING` one is out of scope on purpose).
  - **Southside Neighbors** (org B): geofence over Tower Grove South, scope
    `GRAFFITI`, `ILLEGAL_DUMPING`. Its 2 issues are both in scope.
- **3 org memberships**, listed in the table.

#### Test accounts

All passwords are `password123`.

| Email | Platform role | Org (role) | Use it to test |
|---|---|---|---|
| `reporter@example.com` | REPORTER | none | Reporting, endorsing, the reporter UI. Owns 3 issues, endorses 2. Gets 403 on every responder action. |
| `orgadmin@example.com` | REPORTER | Midtown CID (ORG_ADMIN) | Dispatch and Queue, claiming, member lists. |
| `orgmember@example.com` | REPORTER | Midtown CID (ORG_MEMBER) | Same as above as a plain member. With `orgadmin@`, shows that any member of the claiming org can act on its claim. |
| `otherorg@example.com` | REPORTER | Southside Neighbors (ORG_MEMBER) | Cross-org 403s: org A's member list and org A's claimed issues. |
| `admin@example.com` | ADMIN | none | Platform admin routes: any user's org lookup, any org's member list, status changes and updates on any issue. Cannot claim or release (no org). |

The org role is separate from the platform role, which is why responders show
`role: "REPORTER"` in the login response. The app reads the org role from
`GET /api/organizations/me/membership`.

These accounts sign in through the legacy `POST /api/auth/login` (bcrypt
`passwordHash` on `user`, JWT), which is what the mobile app uses. They have no
BetterAuth credentials, so BetterAuth sign-in at `/api/better-auth` fails for
them. This has to change when the app moves to BetterAuth (#156).

For step-by-step flows per role, see [testing-instructions.md](testing-instructions.md).

### Testing Backend API
1. Seed the database (above), or browse/edit data with `npm run db:studio`
2. Get nearby issues: `curl "http://localhost:3000/api/issues/nearby?lat=38.635&lng=-90.23&radius=5000"`
3. Get issue by id: `curl http://localhost:3000/api/issues/<issue-id>`
4. Creating an issue requires auth: log in first and pass the token
```bash
curl -X POST http://localhost:3000/api/auth/login \
-H "Content-Type: application/json" \
-d '{"email": "reporter@example.com", "password": "password123"}'
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

### Developing outside St. Louis

The seeded issues are all in Midtown St. Louis, so from anywhere else the map is
empty and the app says you are outside the service area. To stand in for your
GPS during development, set both of these in `mobile/.env.local` (gitignored):

```bash
EXPO_PUBLIC_DEV_LAT=38.63965
EXPO_PUBLIC_DEV_LNG=-90.23581
```

Restart Metro after changing them. They are ignored outside development, and
setting only one, or a value that isn't a valid coordinate, shows an error
instead of silently using GPS.

## Web Setup
```bash
cd web
npm install
npm run dev
```
* `npm run build` builds for production
* `npm run deploy` builds and deploys to Cloudflare Workers (requires Wrangler access)
* `npm run check` formats and lints

## Creating a Development Build
1. install and configure eas ([https://docs.expo.dev/build/setup/](url))
   1. to install, run `npm install --global eas-cli`
   2. then install expo-dev-client: `npx expo install expo-dev-client`
2. run `eas credentials` (from /mobile) to connect to an expo account
3. configure a google maps key
   1. follow platform specific instructions on obtaining a key from here: [https://docs.expo.dev/versions/latest/sdk/map-view/](url)
   2. add the key to an .env file as in the mobile directory as `GOOGLE_MAPS_API_KEY="your-key-here"`
   3. do not add the key directly to `app.json` and commit it to git
4. to build, run either `eas build --platform=android --profile=development` or `eas build --platform=ios --profile=development` from the mobile directory
  * any basic changes made, like frontend component changes, will live update in the app
  * any configuration changes (installing a new package, changing `app.json`/`app.config.ts`, etc.) will require a rebuild
    * eas build is only free for 15 dev builds on each platform a month, use wisely
  * You may have to remove `/android` from `.gitignore` for eas to pick up on necessary files, just don't commit this to the repo
5. install and open build on appropriate device, then launch backend with `npm run dev`, and frontend with `npx expo start --dev-client`

