// backend/src/config/__tests__/permissions.test.ts

import { describe, it, expect } from 'vitest';
import { rolePermissions } from '../permissions';

describe('rolePermissions', () => {
  it('grants issue status changes to ADMIN only', () => {
    expect(rolePermissions.ADMIN).toContain('update:issue_status');
    expect(rolePermissions.REPORTER).not.toContain('update:issue_status');
  });

  it('gives ADMIN everything a REPORTER can do', () => {
    for (const permission of rolePermissions.REPORTER) {
      expect(rolePermissions.ADMIN).toContain(permission);
    }
  });

  it('defines a permission list for every role', () => {
    for (const permissions of Object.values(rolePermissions)) {
      expect(Array.isArray(permissions)).toBe(true);
    }
  });
});
