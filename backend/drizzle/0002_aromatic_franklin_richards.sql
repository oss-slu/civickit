CREATE TYPE "public"."PhotoSource" AS ENUM('ISSUE', 'TIMELINE_ENTRY', 'ORGANIZATION', 'USER');--> statement-breakpoint
CREATE TABLE "Image" (
	"id" text PRIMARY KEY NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"link" text NOT NULL,
	"photoTakenAt" timestamp (3) DEFAULT now() NOT NULL,
	"photoTakenAtSource" text DEFAULT 'device' NOT NULL,
	"sourceId" text,
	"source" "PhotoSource",
	"userId" text NOT NULL,
	"width" integer NOT NULL,
	"height" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "Issue" RENAME COLUMN "images" TO "imageIds";--> statement-breakpoint
ALTER TABLE "TimelineEntry" RENAME COLUMN "images" TO "imageIds";--> statement-breakpoint
ALTER TABLE "user" RENAME COLUMN "profileImage" TO "profileImageId";--> statement-breakpoint
ALTER TABLE "Issue" ADD COLUMN "claimedById" text;--> statement-breakpoint
ALTER TABLE "Organization" ADD COLUMN "profileImageId" text;--> statement-breakpoint
ALTER TABLE "Image" ADD CONSTRAINT "Image_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "Image_createdAt_idx" ON "Image" USING btree ("createdAt");--> statement-breakpoint
ALTER TABLE "Issue" DROP COLUMN "photoTakenAt";--> statement-breakpoint
ALTER TABLE "Issue" DROP COLUMN "photoTakenAtSource";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "image";