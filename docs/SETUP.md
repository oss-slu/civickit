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
The app works out the backend address from whichever address Metro is served on, so there is nothing to configure by hand.

1. From the `mobile/` directory
```bash
cd mobile
npm install
```
2. In the `mobile/` directory, start Metro:
```bash
npm start
```

No IP configuration is needed. The app derives the backend URL from whatever
address Metro is served on, which is the same machine running the backend.

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
