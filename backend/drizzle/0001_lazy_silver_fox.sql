CREATE TABLE "Image" (
	"id" text PRIMARY KEY NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"photoTakenAt" timestamp (3) DEFAULT now() NOT NULL,
	"photoTakenAtSource" text DEFAULT 'device' NOT NULL,
	"issueId" text,
	"timelineEntryId" text,
	"link" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "Issue" RENAME COLUMN "images" TO "imageIds";--> statement-breakpoint
ALTER TABLE "TimelineEntry" RENAME COLUMN "images" TO "imageIds";--> statement-breakpoint
ALTER TABLE "user" RENAME COLUMN "image" TO "imageId";--> statement-breakpoint
ALTER TABLE "Image" ADD CONSTRAINT "Image_issueId_Issue_id_fk" FOREIGN KEY ("issueId") REFERENCES "public"."Issue"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Image" ADD CONSTRAINT "Image_timelineEntryId_TimelineEntry_id_fk" FOREIGN KEY ("timelineEntryId") REFERENCES "public"."TimelineEntry"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "Image_issueId_idx" ON "Image" USING btree ("issueId");--> statement-breakpoint
CREATE INDEX "Image_createdAt_idx" ON "Image" USING btree ("createdAt");--> statement-breakpoint
ALTER TABLE "Issue" DROP COLUMN "photoTakenAt";--> statement-breakpoint
ALTER TABLE "Issue" DROP COLUMN "photoTakenAtSource";