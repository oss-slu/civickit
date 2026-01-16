Last updated 1/16/2026
civickit/
├── mobile/                 # React Native (Expo)
│   ├── src/
│   │   ├── screens/        # Screen components
│   │   ├── components/     # Reusable components
│   │   ├── services/       # API calls
│   │   ├── hooks/          # Custom hooks
│   │   ├── types/          # TypeScript types
│   │   ├── utils/          # Helper functions
│   │   └── navigation/     # React Navigation setup
│   ├── app.json
│   ├── package.json
│   └── tsconfig.json
│
├── web/                    # React web dashboard
│   ├── src/
│   │   ├── pages/          # Page components
│   │   ├── components/     # Reusable components
│   │   ├── services/       # API calls
│   │   ├── hooks/          # Custom hooks
│   │   ├── types/          # TypeScript types
│   │   └── utils/          # Helper functions
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── backend/                # Node.js API
│   ├── src/
│   │   ├── controllers/    # Route handlers (SOLID: Single Responsibility)
│   │   ├── services/       # Business logic (SOLID: Separation of Concerns)
│   │   ├── repositories/   # Database access (SOLID: Dependency Inversion)
│   │   ├── middleware/     # Auth, validation, error handling
│   │   ├── routes/         # API routes
│   │   ├── types/          # TypeScript types
│   │   ├── utils/          # Helper functions
│   │   ├── config/         # Configuration
│   │   └── server.ts       # Express app setup
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   └── migrations/     # Database migrations
│   ├── prisma.config.json
│   ├── package.json
│   └── tsconfig.json
│
├── shared/                 # Shared types/utils across mobile, web, backend
│   ├── types/
│   └── constants/
│
├── docs/                   # Documentation
│   ├── ARCHITECTURE.md
│   ├── CODE_OF_CONDUCT.md
│   ├── CONTRIBUTING.md
│   ├── REPOSITORY_STRUCTURE.md
│   ├── SETUP.md
│   └── USER_FLOWS.md
│
├── .github/
│   └── workflows/          # CI/CD pipelines
│       ├── backend-ci.yml
│       ├── mobile-ci.yml
│       └── web-ci.yml
│
├── README.md
├── LICENSE
└── .gitignore