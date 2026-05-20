// Masthead — delegates to the Wake Up Zine Topbar.
// Kept as a thin re-export so existing page imports (`@/components/masthead`)
// keep working without churn during the redesign rollout.
// Source of truth: components/zine/topbar.tsx
// Spec: openspec/specs/zine-design-system

export { Topbar as Masthead } from "@/components/zine/topbar";
