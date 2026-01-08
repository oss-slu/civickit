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
### 2. Set up environment variables
```bash
cp .env.example .env
```

### 3. Setup Backend
```bash
# From civickit folder
cd backend
npm init -y

# Install dependencies
npm install express typescript @types/express @types/node
npm install prisma @prisma/client
npm install dotenv bcryptjs jsonwebtoken
npm install @types/bcryptjs @types/jsonwebtoken
npm install zod express-validator
npm install cors @types/cors
npm install ts-node-dev --save-dev

# Initialize TypeScript
npx tsc --init

# Initialize Prisma
npx prisma init
```


## License
MIT License