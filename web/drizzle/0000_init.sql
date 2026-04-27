CREATE TYPE "public"."input_source" AS ENUM('curated', 'custom', 'migrated');--> statement-breakpoint
CREATE TYPE "public"."quiz_kind" AS ENUM('real', 'fake');--> statement-breakpoint
CREATE TYPE "public"."generation_source" AS ENUM('created', 'migrated');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "generations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"short_id" text NOT NULL,
	"event_value" text NOT NULL,
	"event_source" "input_source" NOT NULL,
	"culprit_value" text NOT NULL,
	"culprit_source" "input_source" NOT NULL,
	"motive_value" text NOT NULL,
	"motive_source" "input_source" NOT NULL,
	"recipe_content" jsonb NOT NULL,
	"model_version" text NOT NULL,
	"recipe_version" text NOT NULL,
	"parent_generation_id" uuid,
	"created_at" timestamp with time zone,
	"source" "generation_source" DEFAULT 'created' NOT NULL,
	"session_hash" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "quiz_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kind" "quiz_kind" NOT NULL,
	"display_text" text NOT NULL,
	"source_generation_id" uuid,
	"historical_label" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ratings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"generation_id" uuid NOT NULL,
	"session_hash" text NOT NULL,
	"score" smallint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "quiz_items" ADD CONSTRAINT "quiz_items_source_generation_id_generations_id_fk" FOREIGN KEY ("source_generation_id") REFERENCES "public"."generations"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ratings" ADD CONSTRAINT "ratings_generation_id_generations_id_fk" FOREIGN KEY ("generation_id") REFERENCES "public"."generations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "generations_short_id_uq" ON "generations" USING btree ("short_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "generations_triple_idx" ON "generations" USING btree ("event_value","culprit_value","motive_value");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "generations_parent_idx" ON "generations" USING btree ("parent_generation_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "generations_created_at_idx" ON "generations" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "quiz_items_kind_idx" ON "quiz_items" USING btree ("kind");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "ratings_one_per_session_uq" ON "ratings" USING btree ("generation_id","session_hash");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ratings_generation_idx" ON "ratings" USING btree ("generation_id");