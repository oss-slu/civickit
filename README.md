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
- Node.js >= 20.19 (Node 22 LTS recommended): https://nodejs.org/en/download, install tools for native modules
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
### 2. Go to [Setup Guide](docs/SETUP.md)

## License
MIT License
