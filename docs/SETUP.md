Last updated 1/16/2026
# Development Setup

## Prerequisites
- Node.js 18+
- PostgreSQL 15+ with PostGIS
- Git

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

## Backend Setup
1. Clone repo
2. `cd backend`
3. `npm install`
4. Copy `.env.example` to `.env` in `backend/` and fill in values
5. Migrate the databse `npx prisma migrate dev --name init`
6. Generate client `npx prisma generate`
7. Start the backend `npm run dev`
8. Server runs on http://localhost:3000

### Testing Backend API
1. Seed/create dev user(if needed) `npx prisma studio`
2. Test APIs by creating an issue
```bash
curl -X POST http://localhost:3000/api/issues \
-H "Content-Type: application/json" \
-d '{
  "title": "Broken sidewalk",
  "description": "Cracked pavement near campus",
  "category": "BROKEN_SIDEWALK",
  "latitude": 41.8781,
  "longitude": -87.6298,
  "images": []
}'
```
3. Get nearby issues: `curl "http://localhost:3000/api/issues/nearby?lat=41.8781&lng=-87.6298"`
4. Get issue by id `curl http://localhost:3000/api/issues/<issue-id>`

## Mobile Setup
1. From the `mobile/` directory
```bash
cd mobile
npm install
```
2. Start the Expo development server with `npx expo start` or  `npx expo start --tunnel if qr code is not working
```bash
npx expo start
```
* Press `i` to open iOS simulator (macOS only)
* Press `a` to open Android emulator
* Press `w` to run in the browser (web)
To run on a physical iOS device from Windows, use tunnel mode:
```bash
npx expo start --tunnel
```
3. Then scan the QR code using the Camera app (iOS) or Expo Go(Android)
* In both cases the app, Expo Go, must be installed on the device

## Web Setup (not created yet)
1. `cd web && npm install`
2. `npm run dev`
