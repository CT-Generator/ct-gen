// Pip + PipRow — wizard stepper indicator. Solid hot square = current step;
// solid ink square = done; outlined paper square = upcoming.
// Spec: zine-design-system / Requirement: Stepper pips.

export function Pip({ state }: { state: "todo" | "now" | "done" }) {
  return <span className={`pip ${state === "now" ? "now" : state === "done" ? "done" : ""}`} />;
}

export function PipRow({ total, current }: { total: number; current: number }) {
  return (
    <div className="pip-row">
      {Array.from({ length: total }, (_, i) => {
        const state: "todo" | "now" | "done" =
          i + 1 === current ? "now" : i + 1 < current ? "done" : "todo";
        return <Pip key={i} state={state} />;
      })}
    </div>
  );
}
