// backend/src/db/__tests__/errors.test.ts
//
// Drizzle wraps the driver's error, so the SQLSTATE the repositories care about
// sits on `cause` rather than the top level. These pin the codes and the
// unwrapping, since a wrong constant fails open -- the error stops being
// recognised and surfaces as a 500.

import { describe, it, expect } from 'vitest';
import { isForeignKeyViolation, isUniqueViolation } from '../errors';

/** Shaped like what drizzle throws: the pg error hangs off `cause`. */
function wrapped(code: string) {
  return Object.assign(new Error('Failed query'), { cause: { code } });
}

describe('isForeignKeyViolation', () => {
  it('recognises a bare foreign_key_violation', () => {
    expect(isForeignKeyViolation({ code: '23503' })).toBe(true);
  });

  it('recognises one wrapped by drizzle', () => {
    expect(isForeignKeyViolation(wrapped('23503'))).toBe(true);
  });

  it('does not confuse it with a unique violation', () => {
    expect(isForeignKeyViolation(wrapped('23505'))).toBe(false);
    expect(isUniqueViolation(wrapped('23503'))).toBe(false);
  });

  it('is false for an error carrying no SQLSTATE', () => {
    expect(isForeignKeyViolation(new Error('database is down'))).toBe(false);
    expect(isForeignKeyViolation(null)).toBe(false);
  });
});
