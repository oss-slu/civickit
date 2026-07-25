// backend/src/db/errors.ts
//
// Prisma raised typed errors with P-codes. Drizzle passes the driver's errors
// through unchanged, so the two conditions the services branch on are
// recognised here instead.

/** Postgres unique_violation. Prisma reported this as P2002. */
const UNIQUE_VIOLATION = '23505';

export function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    (error as { code?: unknown }).code === UNIQUE_VIOLATION
  );
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
