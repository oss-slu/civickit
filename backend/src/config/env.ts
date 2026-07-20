// backend/src/config/env.ts

/**
 * Central, validated access to required environment variables.
 * Throws at import time if a required secret is missing so the process
 * fails closed instead of running with an insecure fallback.
 */
export function requireEnv(name: string, minLength = 1): string {
  const value = process.env[name];
  if (value === undefined || value.length < minLength) {
    throw new Error(
      `Environment variable ${name} is missing or too short ` +
        `(min ${minLength} chars). Refusing to start.`,
    );
  }
  return value;
}

// JWT secret must be present and reasonably long. Never log this value.
export const JWT_SECRET = requireEnv('JWT_SECRET', 16);
