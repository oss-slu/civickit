last updated: 7/21/2026

# CivicKit

Open source civic engagement platform for reporting issues and organizing community action.

## Project Status
In Development - SLU New Venture Accelerator(Summer 2026)

## Team
- Briana Huelsman - Project Lead
- Erin Kelley
- Leah Bragg

## Tech Stack
- **Mobile**: React Native (Expo)
- **Web**: React (TanStack Start + Vite, deployed to Cloudflare Workers)
- **Backend**: Node.js + Express + TypeScript + Prisma
- **Database**: PostgreSQL + PostGIS
- **Image Storage**: Cloudinary
- **Authentication**: BetterAuth

## Documentation
- [Setup Guide](docs/SETUP.md)
- [Contributing](docs/CONTRIBUTING.md)
- [User Flows](docs/USER_FLOWS.md)
- [Security](docs/SECURITY.md)

## Getting Started
### Prerequisites
- Node.js 20+: https://nodejs.org/en/download, install tools for native modules
check installation with ```npm -v```
- Docker (runs PostgreSQL 15 + PostGIS locally)
- Expo Go app installed on your phone (iOS or Android)
- npm

## Running the Project Locally
### 1. Clone the repository
```bash
git clone https://github.com/oss-slu/civickit.git
cd civickit
```
### 2. One-time setup
Installs every project's dependencies, creates `backend/.env`, and starts the database:
```bash
npm install
npm run setup
```
Then fill in your Cloudinary values in `backend/.env` (image upload and seeding need them).

### 3. Start everything
```bash
npm run dev
```
This runs the database, backend, mobile (Expo), and web together. Scan the Expo QR code
with your phone to open the app.

Useful variants:

| command | what it does |
|---|---|
| `npm run dev` | database + backend + mobile + web |
| `npm run dev:services` | database + backend + web only |
| `npm run dev:backend` / `dev:mobile` / `dev:web` | one project on its own |
| `npm run seed` | fill the database with sample issues |
| `npm test` / `npm run typecheck` | run across all projects |

Note: under `npm run dev`, Expo runs without an interactive terminal, so its keyboard
shortcuts (`i`, `a`, `r`) do not work — the QR code and logs still do. To use them, run
`npm run dev:services` in one terminal and `npm run dev:mobile` in another.

For per-project detail, see the [Setup Guide](docs/SETUP.md).

## License
MIT License
