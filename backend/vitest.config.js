// backend/vitest.config.js
import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        include: ['**/*.test.ts'],
        // Run this file before every test file
        //setupFiles: ['./src/__tests__/integration/setup.ts'],
        environment: 'node',
        globals: true,
    }
})