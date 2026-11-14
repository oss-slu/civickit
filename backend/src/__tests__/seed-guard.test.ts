// backend/src/__tests__/seed-guard.test.ts
import { describe, it, expect } from 'vitest';
import { assertSafeSeedTarget, UnsafeSeedTargetError } from '../seed-guard';

const url = (host: string) => `postgresql://postgres:secret@${host}:5432/civickit`;

describe('assertSafeSeedTarget', () => {
    it.each(['localhost', '127.0.0.1', '[::1]', 'host.docker.internal', 'db'])(
        'allows a local database at %s',
        (host) => {
            expect(() => assertSafeSeedTarget({ DATABASE_URL: url(host) })).not.toThrow();
        },
    );

    it('refuses a remote database', () => {
        expect(() => assertSafeSeedTarget({ DATABASE_URL: url('db.example.com') })).toThrow(
            UnsafeSeedTargetError,
        );
    });

    it('allows a remote database only with the explicit opt-in', () => {
        expect(() =>
            assertSafeSeedTarget({ DATABASE_URL: url('db.example.com'), SEED_ALLOW_REMOTE_DB: 'true' }),
        ).not.toThrow();
    });

    it('refuses NODE_ENV=production even for localhost and with the opt-in', () => {
        expect(() =>
            assertSafeSeedTarget({
                NODE_ENV: 'production',
                DATABASE_URL: url('localhost'),
                SEED_ALLOW_REMOTE_DB: 'true',
            }),
        ).toThrow(/production/);
    });

    it('refuses a missing DATABASE_URL', () => {
        expect(() => assertSafeSeedTarget({})).toThrow(/not set/);
    });

    it('does not echo the password from a malformed URL', () => {
        expect(() => assertSafeSeedTarget({ DATABASE_URL: 'not a url secret' })).toThrow(
            /^(?!.*secret).*$/,
        );
    });
});
