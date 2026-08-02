-- Add slug, boundary provenance, and a membership updatedAt column.
-- Written to be safe whether or not the tables already hold rows: the two
-- NOT NULL columns are added nullable, backfilled, then constrained.

-- OrgMembership.updatedAt
ALTER TABLE "OrgMembership" ADD COLUMN "updatedAt" TIMESTAMP(3);
UPDATE "OrgMembership" SET "updatedAt" = "createdAt" WHERE "updatedAt" IS NULL;
ALTER TABLE "OrgMembership" ALTER COLUMN "updatedAt" SET NOT NULL;

-- Organization.slug -- backfilled from id, which is already unique
ALTER TABLE "Organization" ADD COLUMN "slug" TEXT;
UPDATE "Organization" SET "slug" = "id" WHERE "slug" IS NULL;
ALTER TABLE "Organization" ALTER COLUMN "slug" SET NOT NULL;

-- Organization boundary provenance
ALTER TABLE "Organization" ADD COLUMN "boundaryRef" TEXT,
                           ADD COLUMN "boundarySyncedAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Organization_slug_key" ON "Organization"("slug");
