// backend/vitest.config.js
import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        include: ['**/*.test.ts'],
        // '**/*.test.ts' also matches the integration specs, which need a live
        // database. Keep them to `npm run test:integration`, or `npm test` and
        // CI would fail on a machine with no Postgres.
        exclude: [
            '**/node_modules/**',
            '**/dist/**',
            '**/*.integration.test.ts',
        ],
        // Run this file before every test file
        setupFiles: ['./src/__tests__/setup-env.ts'],
        environment: 'node',
        globals: true,
    }
})