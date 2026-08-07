-- backend/drizzle/extensions.sql
--
-- Applied before the generated migrations, by src/db/migrate.ts and by the
-- integration harness.
--
-- drizzle-kit does not manage extensions: nothing in src/db/schema.ts can
-- produce these lines, and they would be lost from any generated file the next
-- time `db:generate` ran. IssueRepository.findNearby is raw PostGIS, so on a
-- database without postgis it fails at query time rather than at startup.
--
-- Kept to the same set prisma/migrations created.
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "fuzzystrmatch";
CREATE EXTENSION IF NOT EXISTS "postgis_tiger_geocoder";
CREATE EXTENSION IF NOT EXISTS "postgis_topology";
