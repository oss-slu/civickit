Last Updated: 1/15/2026
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
2. `cd backend && npm install`
3. Copy `.env.example` to `.env` and fill in values
4. `npm run db:migrate`
5. `npm run dev`
6. http://localhost:3000/health


## Mobile Setup
1. `cd mobile && npm install`
2. `npx expo start` or `npx expo start --tunnel` if qr code isn't working

## Web Setup (not created yet)
1. `cd web && npm install`
2. `npm run dev`
