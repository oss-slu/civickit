CREATE TYPE "public"."BoundarySource" AS ENUM('OFFICIAL', 'UPLOADED', 'FREEHAND');--> statement-breakpoint
CREATE TYPE "public"."EventStatus" AS ENUM('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."IssueCategory" AS ENUM('POTHOLE', 'STREETLIGHT', 'GRAFFITI', 'ILLEGAL_DUMPING', 'BROKEN_SIDEWALK', 'TRAFFIC_SIGNAL', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."IssueStatus" AS ENUM('REPORTED', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'COMMUNITY_RESOLVED');--> statement-breakpoint
CREATE TYPE "public"."OrgRole" AS ENUM('ORG_ADMIN', 'ORG_MEMBER');--> statement-breakpoint
CREATE TYPE "public"."OrgStatus" AS ENUM('PENDING', 'ACTIVE', 'SUSPENDED');--> statement-breakpoint
CREATE TYPE "public"."OrgTier" AS ENUM('STARTER', 'GROWTH', 'FULLSCALE');--> statement-breakpoint
CREATE TYPE "public"."OrgType" AS ENUM('WARD_OFFICE', 'CID', 'BID', 'SBD', 'CDC', 'NONPROFIT', 'CITY_DEPARTMENT', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."Role" AS ENUM('REPORTER', 'ADMIN');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"accountId" text NOT NULL,
	"providerId" text NOT NULL,
	"userId" text NOT NULL,
	"accessToken" text,
	"refreshToken" text,
	"idToken" text,
	"accessTokenExpiresAt" timestamp (3),
	"refreshTokenExpiresAt" timestamp (3),
	"scope" text,
	"password" text,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "EventRsvp" (
	"id" text PRIMARY KEY NOT NULL,
	"status" text NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"eventId" text NOT NULL,
	"userId" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Event" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"status" "EventStatus" DEFAULT 'PLANNED' NOT NULL,
	"startTime" timestamp (3) NOT NULL,
	"endTime" timestamp (3) NOT NULL,
	"latitude" double precision NOT NULL,
	"longitude" double precision NOT NULL,
	"address" text NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) NOT NULL,
	"organizerId" text NOT NULL,
	"issueId" text
);
--> statement-breakpoint
CREATE TABLE "Issue" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"category" "IssueCategory" NOT NULL,
	"status" "IssueStatus" DEFAULT 'REPORTED' NOT NULL,
	"latitude" double precision NOT NULL,
	"longitude" double precision NOT NULL,
	"address" text,
	"district" text,
	"subregion" text,
	"name" text,
	"images" text[] DEFAULT '{}' NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) NOT NULL,
	"locationSource" text DEFAULT 'device' NOT NULL,
	"photoTakenAt" timestamp (3),
	"photoTakenAtSource" text DEFAULT 'device' NOT NULL,
	"userId" text NOT NULL,
	"cityRefNumber" text
);
--> statement-breakpoint
CREATE TABLE "OrgMembership" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"organizationId" text NOT NULL,
	"role" "OrgRole" DEFAULT 'ORG_MEMBER' NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Organization" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"type" "OrgType" NOT NULL,
	"status" "OrgStatus" DEFAULT 'PENDING' NOT NULL,
	"tier" "OrgTier",
	"categoryScope" "IssueCategory"[] DEFAULT '{}' NOT NULL,
	"boundarySource" "BoundarySource",
	"boundaryRef" text,
	"boundarySyncedAt" timestamp (3),
	"geofence" geography(MultiPolygon,4326),
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) NOT NULL,
	CONSTRAINT "Organization_slug_key" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expiresAt" timestamp (3) NOT NULL,
	"token" text NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) NOT NULL,
	"ipAddress" text,
	"userAgent" text,
	"userId" text NOT NULL,
	CONSTRAINT "session_token_key" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "TimelineEntry" (
	"id" text PRIMARY KEY NOT NULL,
	"message" text NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"issueId" text NOT NULL,
	"userId" text NOT NULL,
	"status" "IssueStatus" DEFAULT 'REPORTED' NOT NULL,
	"images" text[] DEFAULT '{}' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Upvote" (
	"id" text PRIMARY KEY NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"issueId" text NOT NULL,
	"userId" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"passwordHash" text,
	"profileImage" text,
	"role" "Role" DEFAULT 'REPORTER' NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) NOT NULL,
	"emailVerified" boolean DEFAULT false NOT NULL,
	"image" text,
	CONSTRAINT "user_email_key" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expiresAt" timestamp (3) NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "EventRsvp" ADD CONSTRAINT "EventRsvp_eventId_Event_id_fk" FOREIGN KEY ("eventId") REFERENCES "public"."Event"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "EventRsvp" ADD CONSTRAINT "EventRsvp_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Event" ADD CONSTRAINT "Event_organizerId_user_id_fk" FOREIGN KEY ("organizerId") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Event" ADD CONSTRAINT "Event_issueId_Issue_id_fk" FOREIGN KEY ("issueId") REFERENCES "public"."Issue"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "OrgMembership" ADD CONSTRAINT "OrgMembership_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "OrgMembership" ADD CONSTRAINT "OrgMembership_organizationId_Organization_id_fk" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "TimelineEntry" ADD CONSTRAINT "TimelineEntry_issueId_Issue_id_fk" FOREIGN KEY ("issueId") REFERENCES "public"."Issue"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "TimelineEntry" ADD CONSTRAINT "TimelineEntry_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Upvote" ADD CONSTRAINT "Upvote_issueId_Issue_id_fk" FOREIGN KEY ("issueId") REFERENCES "public"."Issue"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Upvote" ADD CONSTRAINT "Upvote_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("userId");--> statement-breakpoint
CREATE UNIQUE INDEX "EventRsvp_eventId_userId_key" ON "EventRsvp" USING btree ("eventId","userId");--> statement-breakpoint
CREATE INDEX "EventRsvp_eventId_idx" ON "EventRsvp" USING btree ("eventId");--> statement-breakpoint
CREATE INDEX "Event_startTime_idx" ON "Event" USING btree ("startTime");--> statement-breakpoint
CREATE INDEX "Event_status_idx" ON "Event" USING btree ("status");--> statement-breakpoint
CREATE INDEX "Issue_latitude_longitude_idx" ON "Issue" USING btree ("latitude","longitude");--> statement-breakpoint
CREATE INDEX "Issue_status_idx" ON "Issue" USING btree ("status");--> statement-breakpoint
CREATE INDEX "Issue_category_idx" ON "Issue" USING btree ("category");--> statement-breakpoint
CREATE INDEX "Issue_createdAt_idx" ON "Issue" USING btree ("createdAt");--> statement-breakpoint
CREATE UNIQUE INDEX "OrgMembership_userId_organizationId_key" ON "OrgMembership" USING btree ("userId","organizationId");--> statement-breakpoint
CREATE INDEX "OrgMembership_organizationId_idx" ON "OrgMembership" USING btree ("organizationId");--> statement-breakpoint
CREATE INDEX "OrgMembership_userId_idx" ON "OrgMembership" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "Organization_status_idx" ON "Organization" USING btree ("status");--> statement-breakpoint
CREATE INDEX "Organization_geofence_idx" ON "Organization" USING gist ("geofence");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "TimelineEntry_issueId_idx" ON "TimelineEntry" USING btree ("issueId");--> statement-breakpoint
CREATE INDEX "TimelineEntry_createdAt_idx" ON "TimelineEntry" USING btree ("createdAt");--> statement-breakpoint
CREATE UNIQUE INDEX "Upvote_issueId_userId_key" ON "Upvote" USING btree ("issueId","userId");--> statement-breakpoint
CREATE INDEX "Upvote_issueId_idx" ON "Upvote" USING btree ("issueId");--> statement-breakpoint
CREATE INDEX "user_email_idx" ON "user" USING btree ("email");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");