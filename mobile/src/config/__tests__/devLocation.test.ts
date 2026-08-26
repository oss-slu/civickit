// mobile/src/config/__tests__/devLocation.test.ts
import { afterEach, describe, expect, it } from 'vitest';
import { getDevLocationOverride } from '../devLocation';

function setEnv(options: { dev?: boolean; lat?: string; lng?: string }) {
    (globalThis as any).__DEV__ = options.dev ?? true;

    if (options.lat === undefined) delete process.env.EXPO_PUBLIC_DEV_LAT;
    else process.env.EXPO_PUBLIC_DEV_LAT = options.lat;

    if (options.lng === undefined) delete process.env.EXPO_PUBLIC_DEV_LNG;
    else process.env.EXPO_PUBLIC_DEV_LNG = options.lng;
}

afterEach(() => {
    delete process.env.EXPO_PUBLIC_DEV_LAT;
    delete process.env.EXPO_PUBLIC_DEV_LNG;
});

describe('getDevLocationOverride', () => {
    it('returns null when neither var is set, so the real GPS is used', () => {
        setEnv({});
        expect(getDevLocationOverride()).toBeNull();
    });

    it('returns the configured coordinates', () => {
        setEnv({ lat: '38.6365', lng: '-90.2220' });
        expect(getDevLocationOverride()).toEqual({ latitude: 38.6365, longitude: -90.222 });
    });

    it('is ignored in release builds even when both vars are set', () => {
        setEnv({ dev: false, lat: '38.6365', lng: '-90.2220' });
        expect(getDevLocationOverride()).toBeNull();
    });

    it('throws when only one half is set, rather than silently ignoring it', () => {
        setEnv({ lat: '38.6365' });
        expect(() => getDevLocationOverride()).toThrow(/both/i);

        setEnv({ lng: '-90.2220' });
        expect(() => getDevLocationOverride()).toThrow(/both/i);
    });

    it('rejects non-numeric values instead of coercing them to 0,0', () => {
        setEnv({ lat: 'midtown', lng: '-90.2220' });
        expect(() => getDevLocationOverride()).toThrow(/must be numbers/i);
    });

    it('rejects an empty string, which Number() would turn into 0', () => {
        // Guards the case where someone writes `EXPO_PUBLIC_DEV_LAT=` and would
        // otherwise be silently placed at the equator.
        setEnv({ lat: '', lng: '-90.2220' });
        expect(() => getDevLocationOverride()).toThrow();
    });

    it('catches swapped lat/lng, the most likely way to get this wrong', () => {
        // St. Louis entered backwards: -90.222 is not a valid latitude, so the
        // range check catches the swap rather than dropping the developer in
        // the Indian Ocean.
        setEnv({ lat: '-90.2220', lng: '38.6365' });
        expect(() => getDevLocationOverride()).toThrow(/out of range/i);
    });

    it('rejects out-of-range coordinates', () => {
        setEnv({ lat: '190', lng: '0' });
        expect(() => getDevLocationOverride()).toThrow(/out of range/i);
    });
});
