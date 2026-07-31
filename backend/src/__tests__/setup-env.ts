// backend/src/__tests__/setup-env.ts
// Seeds a FAKE secret for unit tests before any module imports config/env.ts.
// This value is not a real credential and must never be used outside tests.
process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test-only-fake-secret-value-1234';
