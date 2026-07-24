// mobile/src/config/__tests__/env.test.ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const constantsMock: { expoConfig: any; expoGoConfig: any } = {
    expoConfig: null,
    expoGoConfig: null,
};

vi.mock('expo-constants', () => ({
    get default() {
        return constantsMock;
    },
}));

/** env.ts caches its result, so each case needs a fresh module instance. */
async function loadEnv(options: {
    dev?: boolean;
    hostUri?: string | null;
    debuggerHost?: string | null;
    apiUrl?: string;
    apiPort?: string;
}) {
    vi.resetModules();
    (globalThis as any).__DEV__ = options.dev ?? true;
    constantsMock.expoConfig = options.hostUri ? { hostUri: options.hostUri } : {};
    constantsMock.expoGoConfig = options.debuggerHost
        ? { debuggerHost: options.debuggerHost }
        : undefined;

    if (options.apiUrl === undefined) delete process.env.EXPO_PUBLIC_API_URL;
    else process.env.EXPO_PUBLIC_API_URL = options.apiUrl;

    if (options.apiPort === undefined) delete process.env.EXPO_PUBLIC_API_PORT;
    else process.env.EXPO_PUBLIC_API_PORT = options.apiPort;

    return import('../env');
}

beforeEach(() => {
    delete process.env.EXPO_PUBLIC_API_URL;
    delete process.env.EXPO_PUBLIC_API_PORT;
});

afterEach(() => {
    delete (globalThis as any).__DEV__;
});

describe('explicit configuration', () => {
    it('uses EXPO_PUBLIC_API_URL when set', async () => {
        const env = await loadEnv({ apiUrl: 'https://civickit.org/api' });
        expect(env.getApiBaseUrl()).toBe('https://civickit.org/api');
    });

    it('strips trailing slashes so paths do not double up', async () => {
        const env = await loadEnv({ apiUrl: 'https://civickit.org/api//' });
        expect(env.getApiBaseUrl()).toBe('https://civickit.org/api');
    });

    it('wins over the Metro host, including in development', async () => {
        const env = await loadEnv({
            dev: true,
            hostUri: '10.0.0.5:8081',
            apiUrl: 'https://staging.civickit.org/api',
        });
        expect(env.getApiBaseUrl()).toBe('https://staging.civickit.org/api');
    });

    it('is the only source in a release build', async () => {
        const env = await loadEnv({ dev: false, apiUrl: 'https://civickit.org/api' });
        expect(env.getApiBaseUrl()).toBe('https://civickit.org/api');
    });
});

describe('development host derivation', () => {
    it('derives the API host from the Metro host', async () => {
        const env = await loadEnv({ dev: true, hostUri: '10.0.0.5:8081' });
        expect(env.getApiBaseUrl()).toBe('http://10.0.0.5:3000/api');
    });

    it('ignores a path segment on the Metro host', async () => {
        const env = await loadEnv({ dev: true, hostUri: '10.0.0.5:8081/some/path' });
        expect(env.getApiBaseUrl()).toBe('http://10.0.0.5:3000/api');
    });

    it('handles localhost', async () => {
        const env = await loadEnv({ dev: true, hostUri: 'localhost:8081' });
        expect(env.getApiBaseUrl()).toBe('http://localhost:3000/api');
    });

    it('honours EXPO_PUBLIC_API_PORT', async () => {
        const env = await loadEnv({ dev: true, hostUri: '10.0.0.5:8081', apiPort: '4000' });
        expect(env.getApiBaseUrl()).toBe('http://10.0.0.5:4000/api');
    });

    it('falls back to the Expo Go debuggerHost', async () => {
        const env = await loadEnv({ dev: true, debuggerHost: '192.168.1.20:8081' });
        expect(env.getApiBaseUrl()).toBe('http://192.168.1.20:3000/api');
    });
});

describe('failure modes', () => {
    it('throws a directing error when nothing is configured in a release build', async () => {
        const env = await loadEnv({ dev: false });
        expect(() => env.getApiBaseUrl()).toThrow(/EXPO_PUBLIC_API_URL/);
    });

    it('throws when development has no Metro host to work from', async () => {
        const env = await loadEnv({ dev: true });
        expect(() => env.getApiBaseUrl()).toThrow(/EXPO_PUBLIC_API_URL/);
    });

    it('defers resolution until first use rather than throwing on import', async () => {
        // A misconfigured release build must surface through the app's normal
        // request-failure UI, not crash during module initialization.
        await expect(loadEnv({ dev: false })).resolves.toBeDefined();
    });
});

describe('caching', () => {
    it('resolves once and reuses the result', async () => {
        const env = await loadEnv({ dev: true, hostUri: '10.0.0.5:8081' });
        expect(env.getApiBaseUrl()).toBe('http://10.0.0.5:3000/api');

        // A later Metro reconnection must not silently repoint the app mid-session.
        constantsMock.expoConfig = { hostUri: '10.0.0.99:8081' };
        expect(env.getApiBaseUrl()).toBe('http://10.0.0.5:3000/api');
    });
});
