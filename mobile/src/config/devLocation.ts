// mobile/src/config/devLocation.ts
import { userLocation } from '../types/userLocation';

/**
 * Named places a developer is likely to want to stand in, so the common cases
 * need no coordinates at all. Latitude and longitude are easy to swap and the
 * consequence is a silent empty feed, so not typing them is the point.
 */
const DEV_LOCATIONS: Record<string, userLocation> = {
    // Inside the seeded Midtown CID geofence, and within 5 miles of all twelve
    // seeded issues (farthest is 2.44mi). The default for testing the
    // responder flow from anywhere.
    midtown: { latitude: 38.6365, longitude: -90.222 },

    // Deliberately outside the service area, for testing the "You are outside
    // of our service area" banner and the disabled submit button *without*
    // leaving St. Louis.
    'out-of-area': { latitude: 39.7817, longitude: -89.6501 },
};

export const DEV_LOCATION_NAMES = Object.keys(DEV_LOCATIONS);

/**
 * A fixed location to stand in for the device's GPS during development.
 *
 * Two separate things in this app key off where the phone physically is, and
 * both fail closed outside St. Louis:
 *
 *   - `useNearbyIssues` asks the backend for issues within 5 miles of the
 *     device, so a developer anywhere else gets an empty feed.
 *   - `inBounds` tests the device against `assets/shapes/stl_boundary_inverted.json`,
 *     which drives "You are outside of our service area" and disables issue
 *     submission.
 *
 * Neither is reachable from a desk in another city, and the seed fixtures are
 * all St. Louis. This lets a developer borrow those coordinates without a mock
 * GPS app or a simulator, and it replaces a commented-out `setLocation(...)`
 * line that previously had to be edited by hand and un-edited before commit.
 *
 * Normally set a named place in `mobile/.env.local` (gitignored):
 *
 *   EXPO_PUBLIC_DEV_LOCATION=midtown
 *
 * For a point with no name, set both halves instead:
 *
 *   EXPO_PUBLIC_DEV_LAT=38.6365
 *   EXPO_PUBLIC_DEV_LNG=-90.2220
 *
 * Explicit coordinates win over a name, matching how env.ts lets an explicit
 * EXPO_PUBLIC_API_URL beat the derived one.
 *
 * Ignored entirely in release builds — see the `__DEV__` guard below — so this
 * cannot ship a hardcoded location to users even if the vars leak into a
 * production build's environment.
 */
export function getDevLocationOverride(): userLocation | null {
    if (!__DEV__) return null;

    const lat = process.env.EXPO_PUBLIC_DEV_LAT;
    const lng = process.env.EXPO_PUBLIC_DEV_LNG;
    const name = process.env.EXPO_PUBLIC_DEV_LOCATION?.trim();

    // Nothing set at all is the normal case: use the real device location.
    if (!lat && !lng && !name) return null;

    if (!lat && !lng && name) {
        const preset = DEV_LOCATIONS[name.toLowerCase()];
        if (!preset) {
            throw new Error(
                `Unknown EXPO_PUBLIC_DEV_LOCATION "${name}". ` +
                `Valid names: ${DEV_LOCATION_NAMES.join(', ')}. ` +
                'Or set EXPO_PUBLIC_DEV_LAT and EXPO_PUBLIC_DEV_LNG instead.',
            );
        }
        return preset;
    }

    // One set without the other is a typo, not a half-configuration. Failing
    // loudly beats silently ignoring it and leaving the developer wondering why
    // the feed is still empty.
    if (!lat || !lng) {
        throw new Error(
            'Set both EXPO_PUBLIC_DEV_LAT and EXPO_PUBLIC_DEV_LNG, or neither. ' +
            `Got lat=${lat ?? '(unset)'}, lng=${lng ?? '(unset)'}.`,
        );
    }

    const latitude = Number(lat);
    const longitude = Number(lng);

    // Number('') is 0 and Number('abc') is NaN; a silent 0,0 would put the
    // developer in the Gulf of Guinea, which looks the same as "out of area".
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        throw new Error(
            `EXPO_PUBLIC_DEV_LAT/LNG must be numbers. Got lat="${lat}", lng="${lng}".`,
        );
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
        throw new Error(
            `EXPO_PUBLIC_DEV_LAT/LNG out of range. Got lat=${latitude}, lng=${longitude}. ` +
            'Note the order: latitude first, and longitude is negative in the US.',
        );
    }

    return { latitude, longitude };
}
