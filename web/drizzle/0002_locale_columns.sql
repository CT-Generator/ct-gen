ALTER TABLE "generations" ADD COLUMN "locale" text DEFAULT 'en' NOT NULL;--> statement-breakpoint
ALTER TABLE "page_views" ADD COLUMN "locale" text;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "generations_locale_created_at_idx" ON "generations" USING btree ("locale","created_at");