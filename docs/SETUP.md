Last updated 1/16/2026
# Development Setup

## Prerequisites
- Node.js 18+
- PostgreSQL 15+ with PostGIS
- Git

## .env.example
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
Download Expo Go app on phone
1. `cd mobile && npm install`
2. `npx expo start` or `npx expo start --tunnel` if qr code isn't working

## Web Setup (not created yet)
1. `cd web && npm install`
2. `npm run dev`
