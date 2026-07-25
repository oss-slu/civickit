// mobile/src/config/env.ts
import Constants from 'expo-constants';

const DEFAULT_API_PORT = '3000';

/**
 * The LAN host Metro is currently served from — the same machine running the
 * backend during development. Expo already knows this because the device had
 * to reach Metro to load the bundle, so there is nothing to configure by hand.
 */
function devHostFromExpo(): string | null {
    const hostUri =
        Constants.expoConfig?.hostUri ??
        (Constants.expoGoConfig as { debuggerHost?: string } | undefined)?.debuggerHost;

    if (!hostUri) return null;

    // hostUri looks like "10.0.0.5:8081" or "10.0.0.5:8081/some/path"
    const host = hostUri.split('/')[0].split(':')[0];
    return host || null;
}

/**
 * Resolves the API base URL, in priority order:
 *
 *   1. EXPO_PUBLIC_API_URL — set this for staging, production, or a tunnel.
 *   2. In development, derived from the Metro host + EXPO_PUBLIC_API_PORT.
 *
 * Fails loudly rather than falling back to a stale hardcoded URL. Resolution is
 * lazy so a misconfigured build surfaces the error through the app's normal
 * request-failure UI instead of crashing during module initialization.
 */
function resolveApiBaseUrl(): string {
    const explicit = process.env.EXPO_PUBLIC_API_URL;
    if (explicit) {
        return explicit.replace(/\/+$/, '');
    }

    if (__DEV__) {
        const host = devHostFromExpo();
        if (host) {
            const port = process.env.EXPO_PUBLIC_API_PORT ?? DEFAULT_API_PORT;
            return `http://${host}:${port}/api`;
        }
    }

    throw new Error(
        'No API base URL available. Set EXPO_PUBLIC_API_URL (e.g. in mobile/.env) ' +
        'to point the app at a backend. In development this is normally derived ' +
        'from the Metro host automatically.',
    );
}

let cachedBaseUrl: string | null = null;

export function getApiBaseUrl(): string {
    if (cachedBaseUrl === null) {
        cachedBaseUrl = resolveApiBaseUrl();
    }
    return cachedBaseUrl;
}
