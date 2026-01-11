last updated: 1/6/2026

# CivicKit

Open source civic engagement platform for reporting issues and organizing community action.

## Project Status
In Development - Capstone II Project (Spring 2026)

## Team
- Briana Huelsman - Project Lead
- [Names as people join]

## Tech Stack
- **Mobile**: React Native (Expo)
- **Web**: React + Vite
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL + PostGIS
- **Image Storage**: Cloudinary

## Documentation
- [Setup Guide](docs/SETUP.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Contributing](docs/CONTRIBUTING.md)
- [API Docs](docs/API.md)

## Getting Started
### Prerequisites
- Node.js 18+: https://nodejs.org/en/download and install tools for native modules
check installation with ```npm -v```
- PostgreSQL 15+ with PostGIS enabled

## Running the Project Locally
### 1. Clone the repository
```bash
git clone https://github.com/your-org/civickit.git
cd civickit
```
### 2. backend .env example
```bash
PG_USER=postgres
DATABASE_URL="postgresql://postgres:password@localhost:5432/civickit"
JWT_SECRET="your-super-secret-jwt-key-change-this"
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
PORT=3000
```

```
cd backend
npm run dev
http://localhost:3000
```

## License
MIT License