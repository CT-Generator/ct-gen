// Logo — direction A: the question becomes (italic ? leans into upright ! in accent)
// Source: design system, brand-sheets.jsx → LogoSheet (variant A)

type LogoProps = {
  size?: number;
  /** Override the accent — defaults to Move 03 (ink-blue) per the brand sheet. */
  accentClassName?: string;
  className?: string;
};

/** Stand-alone interrobang mark. Picks up size & color from props. */
export function LogoMark({
  size = 32,
  accentClassName = "text-[oklch(56%_0.14_230)]",
  className,
}: LogoProps) {
  // The mark renders as inline text so it inherits the body's font weight scaling.
  // letterSpacing -0.04em pulls the ! tight against the ?.
  return (
    <span
      aria-label="Conspiracy Generator"
      className={`inline-flex items-baseline font-display italic leading-none ${className ?? ""}`}
      style={{ fontSize: size, letterSpacing: "-0.04em", fontWeight: 600 }}
    >
      <span aria-hidden>?</span>
      <span aria-hidden className={`not-italic -ml-[0.22em] ${accentClassName}`}>!</span>
    </span>
  );
}

/** Two-line wordmark "Conspiracy / Generator." */
export function Wordmark({
  className,
  accentClassName = "text-[oklch(56%_0.14_230)]",
}: {
  className?: string;
  accentClassName?: string;
}) {
  return (
    <div
      className={`font-display leading-none ${className ?? ""}`}
      style={{ fontWeight: 600, letterSpacing: "-0.02em" }}
    >
      <div>Conspiracy</div>
      <div className={accentClassName}>
        Generator<span className="text-ink dark:text-ink-dark">.</span>
      </div>
    </div>
  );
}

/** Inline lockup — mark + horizontal divider + name + tagline. */
export function Lockup({
  className,
  size = 28,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <div className={`flex items-center gap-3 ${className ?? ""}`}>
      <LogoMark size={size + 16} />
      <div
        aria-hidden
        className="bg-ink/100 dark:bg-ink-dark/100 self-stretch"
        style={{ width: 1 }}
      />
      <div>
        <div
          className="font-display leading-tight"
          style={{ fontSize: size * 0.8, fontWeight: 600, letterSpacing: "-0.01em" }}
        >
          Conspiracy Generator
        </div>
        <div className="meta mt-1 not-italic">
          Boudry · Meyer · Ghent · Hamburg
        </div>
      </div>
    </div>
  );
}
