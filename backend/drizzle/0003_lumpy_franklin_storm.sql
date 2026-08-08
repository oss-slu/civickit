ALTER TABLE "user" ALTER COLUMN "role" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'REPORTER'::text;--> statement-breakpoint
DROP TYPE "public"."Role";--> statement-breakpoint
CREATE TYPE "public"."Role" AS ENUM('REPORTER', 'ADMIN');--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'REPORTER'::"public"."Role";--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "role" SET DATA TYPE "public"."Role" USING "role"::"public"."Role";