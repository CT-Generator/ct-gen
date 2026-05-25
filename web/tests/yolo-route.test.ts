// Tests for the YOLO route's narrative-retry contract.
// Covers the new "narrative is required for non-cached 2xx" behavior:
// single retry on any narrative failure (throw / invalid output / moderation),
// moves-only persistence on double failure, and the idempotent recovery path.

import { describe, it, expect, beforeEach, vi } from "vitest";

const helpers = vi.hoisted(() => ({
  selectRows: [] as unknown[],
  dbUpdates: [] as Array<{ recipeContent: unknown }>,
}));

vi.mock("@/lib/db", () => ({
  db: () => ({
    select: () => ({
      from: () => ({
        where: () => ({
          limit: async () => helpers.selectRows,
        }),
      }),
    }),
    update: () => ({
      set: (value: { recipeContent: unknown }) => ({
        where: async () => {
          helpers.dbUpdates.push(value);
        },
      }),
    }),
  }),
  schema: { generations: { shortId: {} } },
}));

vi.mock("@/lib/openai", () => ({
  generateNarrative: vi.fn(),
  generateSection: vi.fn(),
  moderate: vi.fn(),
}));

vi.mock("@/lib/i18n", () => ({
  getDict: () => ({
    wizard: {
      err_engine_glitched_yolo: "ENGINE_GLITCHED_YOLO",
      err_engine_refused_yolo: "ENGINE_REFUSED_YOLO",
      err_engine_glitched_section: "ENGINE_GLITCHED_SECTION",
      err_engine_refused_section: "ENGINE_REFUSED_SECTION",
    },
  }),
  isLocale: (x: unknown) => x === "en" || x === "de" || x === "nl",
}));

import { POST } from "@/app/api/build/[id]/yolo/route";
import { generateNarrative, generateSection, moderate } from "@/lib/openai";

const MOVE_KEYS = ["anomaly", "connection", "dismiss", "discredit"] as const;

type FakeRowOptions = {
  perMove?: Record<string, { idea: string; paragraph: string; debunk: string }>;
  narrative?: { paragraphs: string[]; generated_at: string };
};

function fakeRow(options: FakeRowOptions = {}) {
  return {
    shortId: "test-id",
    locale: "en",
    eventValue: "Event",
    culpritValue: "Culprit",
    motiveValue: "Motive",
    recipeContent: {
      event_intro: {
        paragraphs: ["intro paragraph"],
        source_url: "https://example.com",
      },
      ideas: {
        anomaly: ["a1", "a2"],
        connection: ["c1", "c2"],
        dismiss: ["d1", "d2"],
        discredit: ["x1", "x2"],
      },
      per_move: options.perMove ?? {},
      ...(options.narrative ? { narrative: options.narrative } : {}),
    },
  };
}

function fakeRequest(): Request {
  return new Request("http://localhost/api/build/test-id/yolo", {
    method: "POST",
  });
}

function fakeParams() {
  return { params: Promise.resolve({ id: "test-id" }) };
}

const SECTION = (k: string) => ({
  paragraph: `paragraph-${k}`,
  debunk: `debunk-${k}`,
});

const NARRATIVE_PARAGRAPHS = ["p1", "p2", "p3"];

const allFourPerMove = {
  anomaly: { idea: "a1", paragraph: "p-anomaly", debunk: "d-anomaly" },
  connection: { idea: "c1", paragraph: "p-connection", debunk: "d-connection" },
  dismiss: { idea: "d1", paragraph: "p-dismiss", debunk: "d-dismiss" },
  discredit: { idea: "x1", paragraph: "p-discredit", debunk: "d-discredit" },
};

beforeEach(() => {
  helpers.selectRows.length = 0;
  helpers.dbUpdates.length = 0;
  vi.mocked(generateNarrative).mockReset();
  vi.mocked(generateSection).mockReset();
  vi.mocked(moderate).mockReset();

  vi.mocked(generateSection).mockImplementation(async ({ moveKey }) =>
    SECTION(moveKey),
  );
  vi.mocked(moderate).mockResolvedValue({ flagged: false });
});

describe("YOLO route — narrative retry contract", () => {
  it("3.1 narrative throws on first attempt, succeeds on retry → 2xx with narrative persisted", async () => {
    helpers.selectRows.push(fakeRow());
    vi.mocked(generateNarrative)
      .mockRejectedValueOnce(new Error("transient model error"))
      .mockResolvedValueOnce({ paragraphs: NARRATIVE_PARAGRAPHS });

    const res = await POST(fakeRequest(), fakeParams());

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(vi.mocked(generateNarrative)).toHaveBeenCalledTimes(2);
    expect(helpers.dbUpdates).toHaveLength(1);
    const persisted = helpers.dbUpdates[0]!.recipeContent as {
      per_move: Record<string, unknown>;
      narrative?: { paragraphs: string[] };
    };
    expect(Object.keys(persisted.per_move).sort()).toEqual([...MOVE_KEYS].sort());
    expect(persisted.narrative?.paragraphs).toEqual(NARRATIVE_PARAGRAPHS);
  });

  it("3.2 narrative moderation-flagged then passes on retry → 2xx with narrative persisted", async () => {
    helpers.selectRows.push(fakeRow());
    vi.mocked(generateNarrative)
      .mockResolvedValueOnce({ paragraphs: ["bad1", "bad2"] })
      .mockResolvedValueOnce({ paragraphs: NARRATIVE_PARAGRAPHS });
    vi.mocked(moderate)
      .mockResolvedValue({ flagged: false }) // section moderations
      .mockResolvedValueOnce({ flagged: false }) // section 1
      .mockResolvedValueOnce({ flagged: false }) // section 2
      .mockResolvedValueOnce({ flagged: false }) // section 3
      .mockResolvedValueOnce({ flagged: false }) // section 4
      .mockResolvedValueOnce({ flagged: true })  // first narrative
      .mockResolvedValueOnce({ flagged: false }); // retry narrative

    const res = await POST(fakeRequest(), fakeParams());

    expect(res.status).toBe(200);
    expect(vi.mocked(generateNarrative)).toHaveBeenCalledTimes(2);
    expect(helpers.dbUpdates).toHaveLength(1);
    const persisted = helpers.dbUpdates[0]!.recipeContent as {
      narrative?: { paragraphs: string[] };
    };
    expect(persisted.narrative?.paragraphs).toEqual(NARRATIVE_PARAGRAPHS);
  });

  it("3.3 narrative throws on both attempts → 502, per_move persisted with no narrative", async () => {
    helpers.selectRows.push(fakeRow());
    vi.mocked(generateNarrative)
      .mockRejectedValueOnce(new Error("transient 1"))
      .mockRejectedValueOnce(new Error("transient 2"));

    const res = await POST(fakeRequest(), fakeParams());

    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({ error: "ENGINE_GLITCHED_YOLO" });
    expect(vi.mocked(generateNarrative)).toHaveBeenCalledTimes(2);
    expect(helpers.dbUpdates).toHaveLength(1);
    const persisted = helpers.dbUpdates[0]!.recipeContent as {
      per_move: Record<string, unknown>;
      narrative?: unknown;
    };
    expect(Object.keys(persisted.per_move).sort()).toEqual([...MOVE_KEYS].sort());
    expect(persisted.narrative).toBeUndefined();
  });

  it("3.4 narrative moderation-flagged on both attempts → 422, per_move persisted with no narrative", async () => {
    helpers.selectRows.push(fakeRow());
    vi.mocked(generateNarrative)
      .mockResolvedValueOnce({ paragraphs: ["bad-a", "bad-b"] })
      .mockResolvedValueOnce({ paragraphs: ["bad-c", "bad-d"] });
    vi.mocked(moderate)
      .mockResolvedValue({ flagged: false }) // sections default
      .mockResolvedValueOnce({ flagged: false }) // section 1
      .mockResolvedValueOnce({ flagged: false }) // section 2
      .mockResolvedValueOnce({ flagged: false }) // section 3
      .mockResolvedValueOnce({ flagged: false }) // section 4
      .mockResolvedValueOnce({ flagged: true })  // first narrative flagged
      .mockResolvedValueOnce({ flagged: true }); // retry narrative flagged

    const res = await POST(fakeRequest(), fakeParams());

    expect(res.status).toBe(422);
    expect(await res.json()).toEqual({ error: "ENGINE_REFUSED_YOLO" });
    expect(vi.mocked(generateNarrative)).toHaveBeenCalledTimes(2);
    expect(helpers.dbUpdates).toHaveLength(1);
    const persisted = helpers.dbUpdates[0]!.recipeContent as {
      per_move: Record<string, unknown>;
      narrative?: unknown;
    };
    expect(Object.keys(persisted.per_move).sort()).toEqual([...MOVE_KEYS].sort());
    expect(persisted.narrative).toBeUndefined();
  });

  it("3.5 idempotent narrative-only recovery: all moves present, no narrative, retry succeeds → 2xx with narrative, no sections regenerated", async () => {
    helpers.selectRows.push(fakeRow({ perMove: allFourPerMove }));
    vi.mocked(generateNarrative)
      .mockRejectedValueOnce(new Error("transient"))
      .mockResolvedValueOnce({ paragraphs: NARRATIVE_PARAGRAPHS });

    const res = await POST(fakeRequest(), fakeParams());

    expect(res.status).toBe(200);
    expect(vi.mocked(generateSection)).not.toHaveBeenCalled();
    expect(vi.mocked(generateNarrative)).toHaveBeenCalledTimes(2);
    expect(helpers.dbUpdates).toHaveLength(1);
    const persisted = helpers.dbUpdates[0]!.recipeContent as {
      per_move: Record<string, { paragraph: string }>;
      narrative?: { paragraphs: string[] };
    };
    expect(persisted.per_move.anomaly?.paragraph).toBe("p-anomaly");
    expect(persisted.narrative?.paragraphs).toEqual(NARRATIVE_PARAGRAPHS);
  });

  it("3.6 all-complete short-circuit: per_move + narrative present → cached: true with no model calls", async () => {
    helpers.selectRows.push(
      fakeRow({
        perMove: allFourPerMove,
        narrative: { paragraphs: ["already", "there"], generated_at: "2026-01-01T00:00:00Z" },
      }),
    );

    const res = await POST(fakeRequest(), fakeParams());

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, cached: true });
    expect(vi.mocked(generateNarrative)).not.toHaveBeenCalled();
    expect(vi.mocked(generateSection)).not.toHaveBeenCalled();
    expect(vi.mocked(moderate)).not.toHaveBeenCalled();
    expect(helpers.dbUpdates).toHaveLength(0);
  });
});
