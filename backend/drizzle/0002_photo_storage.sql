CREATE TYPE "public"."PhotoTimestampSource" AS ENUM('exif', 'device');--> statement-breakpoint
CREATE TYPE "public"."TimelineEntryType" AS ENUM('COMMENT', 'SYSTEM_REPORT_SUBMITTED');--> statement-breakpoint
CREATE TABLE "Photo" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"issueId" text,
	"timelineEntryId" text,
	"url" text NOT NULL,
	"publicId" text,
	"width" integer,
	"height" integer,
	"photoTakenAt" timestamp (3),
	"photoTakenAtSource" "PhotoTimestampSource",
	"position" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"deletedAt" timestamp (3)
);
--> statement-breakpoint
ALTER TABLE "Issue" ADD COLUMN "claimedById" text;--> statement-breakpoint
ALTER TABLE "Organization" ADD COLUMN "profilePhotoId" text;--> statement-breakpoint
ALTER TABLE "TimelineEntry" ADD COLUMN "entryType" "TimelineEntryType" DEFAULT 'COMMENT' NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "profilePhotoId" text;--> statement-breakpoint
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_issueId_Issue_id_fk" FOREIGN KEY ("issueId") REFERENCES "public"."Issue"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_timelineEntryId_TimelineEntry_id_fk" FOREIGN KEY ("timelineEntryId") REFERENCES "public"."TimelineEntry"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "Photo_issueId_idx" ON "Photo" USING btree ("issueId");--> statement-breakpoint
CREATE INDEX "Photo_timelineEntryId_idx" ON "Photo" USING btree ("timelineEntryId");--> statement-breakpoint
CREATE INDEX "Photo_userId_idx" ON "Photo" USING btree ("userId");