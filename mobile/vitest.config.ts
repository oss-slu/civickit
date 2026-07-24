import { defineConfig } from 'vitest/config';

// Unit tests only — these cover the plain-TypeScript layers (API client, env
// resolution). Rendering React Native components would need jest-expo; that is
// deliberately out of scope here.
export default defineConfig({
    test: {
        environment: 'node',
        include: ['src/**/__tests__/**/*.test.ts'],
    },
});
