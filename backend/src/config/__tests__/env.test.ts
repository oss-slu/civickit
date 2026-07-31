// backend/src/config/__tests__/env.test.ts

import { describe, it, expect, afterEach } from 'vitest';
import { requireEnv } from '../env';

describe('requireEnv', () => {
    const testVarName = 'REQUIRE_ENV_TEST_VAR';

    afterEach(() => {
        delete process.env[testVarName];
    });

    it('returns the value when present and >= minLength', () => {
        process.env[testVarName] = 'a-sufficiently-long-value';

        const result = requireEnv(testVarName, 10);

        expect(result).toBe('a-sufficiently-long-value');
    });

    it('throws when the variable is unset, and the message names the variable', () => {
        expect(() => requireEnv('DEFINITELY_UNSET_VAR_FOR_TEST')).toThrow(
            /DEFINITELY_UNSET_VAR_FOR_TEST/
        );
    });

    it('throws when the variable is present but shorter than minLength', () => {
        process.env[testVarName] = 'short';

        expect(() => requireEnv(testVarName, 20)).toThrow();
    });

    it('does not include the variable value in the thrown message', () => {
        const secretValue = 'super-secret-value-should-not-leak';
        process.env[testVarName] = secretValue;

        let thrown: unknown;
        try {
            requireEnv(testVarName, 1000);
        } catch (error) {
            thrown = error;
        }

        expect(thrown).toBeInstanceOf(Error);
        expect((thrown as Error).message).not.toContain(secretValue);
    });
});
