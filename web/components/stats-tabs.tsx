// Shared three-tab nav for /stats and /stats/visitors.
// Spec: openspec/changes/visitor-tracking/specs/visitor-analytics/spec.md

import Link from "next/link";

export type StatsTab = "v1" | "v2" | "visitors";

// Zine accent — hot pink, mirrors the rest of the redesign.
const ACCENT = "var(--hot)";

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
      className="label"
      style={{
        padding: "8px 14px",
        marginBottom: -2,
        textDecoration: "none",
        color: active ? "var(--hot-2)" : "var(--ink)",
        borderBottom: active ? `3px solid ${ACCENT}` : "3px solid transparent",
        opacity: active ? 1 : 0.55,
      }}
    >
      {label}
    </Link>
  );
}
