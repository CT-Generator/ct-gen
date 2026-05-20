// Locale-aware result-page H1. EN keeps the existing fragment template
// ("How {culprit} orchestrated {event}, in service of {motive}."). DE and NL
// use a verbless em-dash construction ("Hinter {event} — {culprit}. Alles für
// {motive}.") because every DE/NL seed culprit starts with "Die"/"De" plus
// some are plural and some singular, which made the active-voice template
// produce capital-article-mid-sentence and subject-verb agreement errors for
// most rows in the seed catalog.
//
// Spec: openspec/changes/yolo-narrative-polish/specs/internationalization/spec.md

import type { Locale } from "@/lib/i18n/types";
import type { Move } from "@/lib/recipe";

type Props = {
  locale: Locale;
  /** Move definitions for the row's locale; index 0 = anomaly (culprit color),
   *  2 = dismiss (event color), 3 = discredit (motive color). Matches the
   *  existing /g/[id] H1 color assignments. */
  moves: Pick<Move, "color">[];
  /** Localized H1 fragment strings; only EN's set is used today (the DE/NL
   *  fragments are intentionally ignored because the DE/NL render path uses
   *  the verbless em-dash construction with hardcoded connective tissue). */
  fragments: {
    h1_how: string;
    h1_orchestrated: string;
    h1_in_service_of: string;
    h1_period: string;
  };
  culprit: string;
  event: string;
  motive: string;
};

const H1_CLASS =
  "mt-2 font-display text-[clamp(1.6rem,4.5vw,2.4rem)] leading-[1.05] max-w-2xl";
const H1_STYLE = { fontWeight: 600, letterSpacing: "-0.02em" } as const;

export function TheoryHeadline({
  locale,
  moves,
  fragments,
  culprit,
  event,
  motive,
}: Props) {
  const culpritColor = moves[0]?.color;
  const eventColor = moves[2]?.color;
  const motiveColor = moves[3]?.color;

  if (locale === "en") {
    // Event names are journalistic headlines and many are full sentences with
    // their own verb ("Exercise Prevents Heart Rhythm Disorder"). Wrapping the
    // event in curly quotes signals "this is an embedded title" so the reader
    // doesn't try to parse the headline as a clause inside the H1 sentence.
    return (
      <h1 className={H1_CLASS} style={H1_STYLE}>
        {fragments.h1_how}{" "}
        <span style={{ color: culpritColor }}>{culprit}</span>{" "}
        {fragments.h1_orchestrated}{" "}
        “<span style={{ color: eventColor }}>{event}</span>”
        {fragments.h1_in_service_of}{" "}
        <span style={{ color: motiveColor }}>{motive.toLowerCase()}</span>
        {fragments.h1_period}
      </h1>
    );
  }

  // DE and NL: verbless construction. Order is event → culprit → motive,
  // separated by em-dash + period so no inflection or verb agreement is needed.
  // Connective phrasing is hardcoded per locale — it's two words per locale
  // and lives here rather than in the dictionary because the construction
  // shape itself is the localization, not the words.
  //
  // Motive casing: German requires nouns to be capitalized, so the motive is
  // rendered verbatim (no toLowerCase). Dutch tolerates lowercase common nouns
  // and matches the EN visual flow, so the motive is lowercased.
  const connectives =
    locale === "de"
      ? { lead: "Hinter", joinDash: " — ", motiveLead: ". Alles für " }
      : { lead: "Achter", joinDash: " — ", motiveLead: ". Allemaal voor " };
  const motiveDisplay = locale === "de" ? motive : motive.toLowerCase();

  return (
    <h1 className={H1_CLASS} style={H1_STYLE}>
      {connectives.lead}{" "}
      <span style={{ color: eventColor }}>{event}</span>
      {connectives.joinDash}
      <span style={{ color: culpritColor }}>{culprit}</span>
      {connectives.motiveLead}
      <span style={{ color: motiveColor }}>{motiveDisplay}</span>
      {fragments.h1_period}
    </h1>
  );
}
