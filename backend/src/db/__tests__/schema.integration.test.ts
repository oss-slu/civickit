// backend/src/db/__tests__/schema.integration.test.ts
//
// The geofence is the one column drizzle-kit cannot infer from a plain Drizzle
// type -- it comes from a customType, and its index needs an access method
// drizzle-kit only emits when asked. Both failures are silent at runtime, so
// they are asserted against the real database instead.

import { describe, it, expect } from 'vitest';
import { sql } from 'drizzle-orm';
import db from '../index';

describe('Organization DDL', () => {
  it('stores the geofence as geography(MultiPolygon,4326)', async () => {
    const result = await db.execute(sql`
      SELECT format_type(a.atttypid, a.atttypmod) AS type
      FROM pg_attribute a
      WHERE a.attrelid = '"Organization"'::regclass
        AND a.attname = 'geofence'
    `);

    expect(result.rows[0]).toEqual({ type: 'geography(MultiPolygon,4326)' });
  });

  // Without this the service-area lookup is a sequential scan over every org.
  it('indexes the geofence with GIST', async () => {
    const result = await db.execute(sql`
      SELECT am.amname
      FROM pg_class i
      JOIN pg_index ix ON ix.indexrelid = i.oid
      JOIN pg_am am ON am.oid = i.relam
      WHERE i.relname = 'Organization_geofence_idx'
    `);

    expect(result.rows[0]).toEqual({ amname: 'gist' });
  });
});
