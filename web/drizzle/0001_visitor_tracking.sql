CREATE TABLE IF NOT EXISTS "page_views" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_hash" text NOT NULL,
	"path" text NOT NULL,
	"referrer_host" text,
	"device_class" text NOT NULL,
	"country" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "page_views_created_at_idx" ON "page_views" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "page_views_session_idx" ON "page_views" USING btree ("session_hash");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "page_views_path_idx" ON "page_views" USING btree ("path");