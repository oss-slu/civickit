CREATE TABLE "PushToken" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"token" text NOT NULL,
	"platform" text NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"lastSeenAt" timestamp (3) DEFAULT now() NOT NULL,
	CONSTRAINT "PushToken_token_unique" UNIQUE("token")
);
