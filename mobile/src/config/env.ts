// mobile/src/config/env.ts
import Constants from 'expo-constants';

const DEFAULT_API_PORT = '3000';

const IPV4 = /^(\d{1,3}\.){3}\d{1,3}$/;

/**
 * Whether the backend can be assumed to sit on the same host as Metro.
 *
 * True for localhost, any IPv4 literal (a LAN address, or a Tailscale 100.x
 * address), and Tailscale MagicDNS names — in all of these Metro is served
 * from the dev machine itself, which is also running the backend. That covers
 * both supported setups: same wifi, and Tailscale.
 *
 * False for anything else, such as a relay domain from `expo start --tunnel`,
 * which has no backend behind it.
 */
function isSameHostAsBackend(host: string): boolean {
    return (
        host === 'localhost' ||
        host === '127.0.0.1' ||
        IPV4.test(host) ||
        host.endsWith('.ts.net')
    );
}

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
 *   1. EXPO_PUBLIC_API_URL — set this for staging or production.
 *   2. In development, derived from the Metro host + EXPO_PUBLIC_API_PORT,
 *      which works both on a shared wifi and over Tailscale.
 *
 * The explicit value must win over Metro-host derivation, so that a deployed
 * backend is never overridden by whatever address Metro happens to be on.
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

        if (host && isSameHostAsBackend(host)) {
            const port = process.env.EXPO_PUBLIC_API_PORT ?? DEFAULT_API_PORT;
            return `http://${host}:${port}/api`;
        }

        // Metro is reachable but the backend is not at the same address. Say so
        // instead of returning a URL that can only time out.
        if (host) {
            throw new Error(
                `Metro is served from "${host}", which is neither a LAN nor a Tailscale ` +
                'address, so the backend is not reachable there. Start Metro with ' +
                '`npm start` (same wifi) or `npm run start:tailscale` (any network) — ' +
                'see docs/SETUP.md.',
            );
        }
    }

    throw new Error(
        'No API base URL available. Set EXPO_PUBLIC_API_URL (e.g. in mobile/.env.local) ' +
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
