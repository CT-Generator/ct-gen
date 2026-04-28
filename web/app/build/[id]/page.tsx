// /build/[id] — stepwise wizard.
// Server component reads the row, hands the wizard state to the client component,
// which drives screen-by-screen navigation: intro → 4 move screens → done.

import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db, schema } from "@/lib/db";
import { Masthead } from "@/components/masthead";
import { Footer } from "@/components/footer";
import { BuildWizard } from "@/components/build-wizard";
import { getMoves, type WizardContent } from "@/lib/recipe";
import { isLocale, getDict, type Locale } from "@/lib/i18n";

type Params = { id: string };

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Building…" };
}

export default async function BuildPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const row = (
    await db()
      .select()
      .from(schema.generations)
      .where(eq(schema.generations.shortId, id))
      .limit(1)
  )[0];
  if (!row) notFound();

  const content = row.recipeContent as WizardContent;
  if (!content.event_intro || !content.ideas) {
    // Legacy or non-wizard row — redirect to the read-only page.
    notFound();
  }

  // Wizard locale follows the persisted row, not the visitor's UI locale.
  // (A returning visitor on /de/build/<id> for an EN row sees an EN wizard;
  // the in-flight build matches the locale it was started in.)
  const rowLocale: Locale = isLocale(row.locale) ? row.locale : "en";
  const dict = getDict(rowLocale);
  const moves = getMoves(rowLocale);

  return (
    <>
      <Masthead />
      <BuildWizard
        shortId={id}
        eventName={row.eventValue}
        culpritName={row.culpritValue}
        motiveName={row.motiveValue}
        intro={content.event_intro}
        ideas={content.ideas}
        initialPerMove={content.per_move ?? {}}
        locale={rowLocale}
        moves={moves.map((m) => ({
          n: m.n,
          key: m.key,
          title: m.title,
          color: m.color,
        }))}
        labels={dict.wizard}
        blurb={dict.wizard_blurb}
      />
      <Footer />
    </>
  );
}
