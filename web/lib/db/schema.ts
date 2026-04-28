// Drizzle schema for the v2 data platform.
// Spec: openspec/changes/v2-rebuild/specs/data-platform/spec.md

import { sql } from "drizzle-orm";
import {
  pgTable,
  uuid,
  text,
  timestamp,
  smallint,
  jsonb,
  pgEnum,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const sourceEnum = pgEnum("generation_source", ["created", "migrated"]);
export const inputSourceEnum = pgEnum("input_source", ["curated", "custom", "migrated"]);
export const quizKindEnum = pgEnum("quiz_kind", ["real", "fake"]);

export const generations = pgTable(
  "generations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    shortId: text("short_id").notNull(),

    eventValue: text("event_value").notNull(),
    eventSource: inputSourceEnum("event_source").notNull(),
    culpritValue: text("culprit_value").notNull(),
    culpritSource: inputSourceEnum("culprit_source").notNull(),
    motiveValue: text("motive_value").notNull(),
    motiveSource: inputSourceEnum("motive_source").notNull(),

    /**
     * Recipe-tagged JSON. For new rows: { anomalies, connect_dots, dismiss_counter, discredit_critics, debunk }.
     * For migrated rows: { legacy_text: "...", recipe_tags: null }.
     */
    recipeContent: jsonb("recipe_content").notNull(),

    modelVersion: text("model_version").notNull(),
    recipeVersion: text("recipe_version").notNull(),

    parentGenerationId: uuid("parent_generation_id"),

    createdAt: timestamp("created_at", { withTimezone: true }),
    source: sourceEnum("source").notNull().default("created"),

    sessionHash: text("session_hash"),
  },
  (t) => ({
    shortIdUq: uniqueIndex("generations_short_id_uq").on(t.shortId),
    triplesIdx: index("generations_triple_idx").on(t.eventValue, t.culpritValue, t.motiveValue),
    parentIdx: index("generations_parent_idx").on(t.parentGenerationId),
    createdAtIdx: index("generations_created_at_idx").on(t.createdAt),
  }),
);

export const ratings = pgTable(
  "ratings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    generationId: uuid("generation_id")
      .notNull()
      .references(() => generations.id, { onDelete: "cascade" }),
    sessionHash: text("session_hash").notNull(),
    score: smallint("score").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    perSessionUq: uniqueIndex("ratings_one_per_session_uq").on(t.generationId, t.sessionHash),
    generationIdx: index("ratings_generation_idx").on(t.generationId),
  }),
);

export const quizItems = pgTable(
  "quiz_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    kind: quizKindEnum("kind").notNull(),
    displayText: text("display_text").notNull(),
    sourceGenerationId: uuid("source_generation_id").references(() => generations.id, {
      onDelete: "set null",
    }),
    historicalLabel: text("historical_label"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    kindIdx: index("quiz_items_kind_idx").on(t.kind),
  }),
);

// Spec: openspec/changes/visitor-tracking/specs/visitor-analytics/spec.md
//
// One row per real human page view. No PII at rest:
// - session_hash is the same salted hash used by the cgen_sid cookie
// - path is the local URL path only (no query string)
// - referrer_host is the host portion of the Referer header only (no path / query)
// - device_class is 'mobile' or 'desktop' — UA itself is never stored
// - country is an ISO-3166 alpha-2 code from a configurable request header (or null)
export const pageViews = pgTable(
  "page_views",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sessionHash: text("session_hash").notNull(),
    path: text("path").notNull(),
    referrerHost: text("referrer_host"),
    deviceClass: text("device_class").notNull(),
    country: text("country"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    createdAtIdx: index("page_views_created_at_idx").on(t.createdAt),
    sessionIdx: index("page_views_session_idx").on(t.sessionHash),
    pathIdx: index("page_views_path_idx").on(t.path),
  }),
);

// Drizzle-kit needs `sql` imported somewhere even when no raw SQL is used in this file.
export const _sqlImport = sql;
