// filepath: backend/src/seed-guard.ts
/**
 * The seed deletes every row before inserting fixtures with a shared, public
 * password. Run against a real database, that destroys user data and leaves
 * behind accounts anyone can log into, including a platform ADMIN. This refuses
 * any target that is not plainly a local development database.
 */

// Hosts a developer's own Postgres is reachable at: the machine itself, or the
// docker compose service from inside another container.
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1', '[::1]', 'host.docker.internal', 'db']);

export const ALLOW_REMOTE_ENV = 'SEED_ALLOW_REMOTE_DB';

export class UnsafeSeedTargetError extends Error {}

export function assertSafeSeedTarget(env: NodeJS.ProcessEnv = process.env): void {
    // No override for this one. A production process has no reason to seed.
    if (env.NODE_ENV === 'production') {
        throw new UnsafeSeedTargetError(
            'Refusing to seed: NODE_ENV is "production". The seed wipes every table.',
        );
    }

    const url = env.DATABASE_URL;
    if (!url) {
        throw new UnsafeSeedTargetError('Refusing to seed: DATABASE_URL is not set.');
    }

    let host: string;
    try {
        host = new URL(url).hostname;
    } catch {
        // Do not echo the URL: it carries the database password.
        throw new UnsafeSeedTargetError('Refusing to seed: DATABASE_URL is not a valid URL.');
    }

    if (LOCAL_HOSTS.has(host) || env[ALLOW_REMOTE_ENV] === 'true') {
        return;
    }

    throw new UnsafeSeedTargetError(
        `Refusing to seed: DATABASE_URL points at "${host}", which is not a local ` +
            `database. The seed wipes every table. If this really is a disposable ` +
            `database, set ${ALLOW_REMOTE_ENV}=true.`,
    );
}
