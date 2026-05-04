CREATE TABLE IF NOT EXISTS "client_errors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"path" text NOT NULL,
	"locale" text NOT NULL,
	"message" text NOT NULL,
	"stack" text,
	"digest" text,
	"referrer_host" text,
	"device_class" text NOT NULL,
	"country" text,
	"session_hash" text NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "client_errors_created_at_idx" ON "client_errors" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "client_errors_path_idx" ON "client_errors" USING btree ("path");