// backend/vitest.integration.config.js
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['src/**/*.integration.test.ts'],
    // Builds the schema once per run, rather than once per test file.
    globalSetup: ['./src/__tests__/integration/global-setup.ts'],
    setupFiles: ['./src/__tests__/integration/setup.ts'],
    // Every file shares one database and truncates between cases, so running
    // them in parallel would have them delete each other's rows.
    fileParallelism: false,
    environment: 'node',
    globals: true,
  }
})
