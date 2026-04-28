// Shared three-tab nav for /stats and /stats/visitors.
// Spec: openspec/changes/visitor-tracking/specs/visitor-analytics/spec.md

import Link from "next/link";
import { MOVES } from "@/lib/recipe";

export type StatsTab = "v1" | "v2" | "visitors";

const ACCENT = MOVES[0].color;

export function StatsTabs({ active }: { active: StatsTab }) {
  return (
    <nav className="mt-8 flex flex-wrap gap-px border-b border-ink/15 dark:border-ink-dark/15">
      <TabLink
        active={active === "v2"}
        href={{ pathname: "/stats", query: { tab: "v2" } }}
        label="v2 — Next.js wizard"
      />
      <TabLink
        active={active === "v1"}
        href={{ pathname: "/stats", query: { tab: "v1" } }}
        label="v1 — legacy (imported)"
      />
      <TabLink
        active={active === "visitors"}
        href={{ pathname: "/stats/visitors" }}
        label="Visitors"
      />
    </nav>
  );
}

function TabLink({
  active,
  href,
  label,
}: {
  active: boolean;
  href: React.ComponentProps<typeof Link>["href"];
  label: string;
}) {
  return (
    <Link
      href={href}
      className="px-4 py-2 -mb-px font-mono uppercase text-[11px] tracking-[0.14em]"
      style={{
        borderBottom: active ? `2px solid ${ACCENT}` : "2px solid transparent",
        opacity: active ? 1 : 0.55,
      }}
    >
      {label}
    </Link>
  );
}
