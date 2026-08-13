CREATE TYPE "public"."PhotoSource" AS ENUM('ISSUE', 'TIMELINE_ENTRY', 'ORGANIZATION', 'USER');--> statement-breakpoint
ALTER TABLE "Image" RENAME COLUMN "issueId" TO "sourceId";--> statement-breakpoint
ALTER TABLE "Image" DROP CONSTRAINT "Image_issueId_Issue_id_fk";
--> statement-breakpoint
ALTER TABLE "Image" DROP CONSTRAINT "Image_userId_user_id_fk";
--> statement-breakpoint
ALTER TABLE "Image" DROP CONSTRAINT "Image_orgId_Organization_id_fk";
--> statement-breakpoint
ALTER TABLE "Image" DROP CONSTRAINT "Image_timelineEntryId_TimelineEntry_id_fk";
--> statement-breakpoint
DROP INDEX "Image_issueId_idx";--> statement-breakpoint
ALTER TABLE "Image" ADD COLUMN "source" "PhotoSource";--> statement-breakpoint
ALTER TABLE "Image" DROP COLUMN "userId";--> statement-breakpoint
ALTER TABLE "Image" DROP COLUMN "orgId";--> statement-breakpoint
ALTER TABLE "Image" DROP COLUMN "timelineEntryId";--> statement-breakpoint
ALTER TABLE "Image" DROP COLUMN "link";