ALTER TABLE "Issue"
ADD COLUMN "locationSource" TEXT NOT NULL DEFAULT 'device',
ADD COLUMN "photoTakenAt" TIMESTAMP(3),
ADD COLUMN "photoTakenAtSource" TEXT NOT NULL DEFAULT 'device';
