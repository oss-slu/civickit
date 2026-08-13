ALTER TABLE "Image" DROP CONSTRAINT "Image_timelineEntryId_TimelineEntry_id_fk";
--> statement-breakpoint
ALTER TABLE "Image" ADD COLUMN "userId" text;--> statement-breakpoint
ALTER TABLE "Image" ADD CONSTRAINT "Image_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Image" ADD CONSTRAINT "Image_userId_Organization_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."Organization"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Image" ADD CONSTRAINT "Image_userId_TimelineEntry_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."TimelineEntry"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Image" DROP COLUMN "timelineEntryId";