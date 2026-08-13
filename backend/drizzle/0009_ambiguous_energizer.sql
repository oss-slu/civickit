ALTER TABLE "user" RENAME COLUMN "profileImage" TO "profileImageId";--> statement-breakpoint
ALTER TABLE "Image" ALTER COLUMN "width" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "Image" ALTER COLUMN "height" SET NOT NULL;