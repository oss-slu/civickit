// backend/src/db/errors.ts
//
// Prisma raised typed errors with P-codes. Drizzle passes the driver's errors
// through, but wrapped: a failed query arrives as a DrizzleQueryError carrying
// the pg error -- the one holding the SQLSTATE -- on `cause`. Checking only the
// top-level `code` silently misses every one of them.

/** Postgres unique_violation. Prisma reported this as P2002. */
const UNIQUE_VIOLATION = '23505';

/** Guards against a cause chain that loops back on itself. */
const MAX_CAUSE_DEPTH = 5;

/** The SQLSTATE a failed query carries, from anywhere in the cause chain. */
export function sqlStateOf(error: unknown, depth = 0): string | null {
  if (depth > MAX_CAUSE_DEPTH) return null;
  if (typeof error !== 'object' || error === null) return null;

  const candidate = error as { code?: unknown; cause?: unknown };
  if (typeof candidate.code === 'string') return candidate.code;

  return sqlStateOf(candidate.cause, depth + 1);
}

export function isUniqueViolation(error: unknown): boolean {
  return sqlStateOf(error) === UNIQUE_VIOLATION;
}

/**
 * Prisma threw P2025 when an update or delete matched no row. Postgres reports
 * no error at all for that -- the statement simply affects zero rows -- so the
 * repositories check the returned rows and raise this instead.
 */
export class RecordNotFoundError extends Error {
  constructor(message = 'Record not found') {
    super(message);
    this.name = 'RecordNotFoundError';
    Object.setPrototypeOf(this, RecordNotFoundError.prototype);
  }
}
