ALTER TABLE "Image" DROP CONSTRAINT "Image_userId_Organization_id_fk";
--> statement-breakpoint
ALTER TABLE "Image" DROP CONSTRAINT "Image_userId_TimelineEntry_id_fk";
--> statement-breakpoint
ALTER TABLE "Image" ADD COLUMN "orgId" text;--> statement-breakpoint
ALTER TABLE "Image" ADD COLUMN "timelineEntryId" text;--> statement-breakpoint
ALTER TABLE "Image" ADD CONSTRAINT "Image_orgId_Organization_id_fk" FOREIGN KEY ("orgId") REFERENCES "public"."Organization"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Image" ADD CONSTRAINT "Image_timelineEntryId_TimelineEntry_id_fk" FOREIGN KEY ("timelineEntryId") REFERENCES "public"."TimelineEntry"("id") ON DELETE restrict ON UPDATE cascade;