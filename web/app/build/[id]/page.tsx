// /build/[id] — stepwise wizard.
// Server component reads the row, hands the wizard state to the client component,
// which drives screen-by-screen navigation: intro → 4 move screens → done.

import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db, schema } from "@/lib/db";
import { Masthead } from "@/components/masthead";
import { Footer } from "@/components/footer";
import { BuildWizard } from "@/components/build-wizard";
import type { WizardContent } from "@/lib/recipe";

type Params = { id: string };

export const dynamic = "force-dynamic";
export const metadata = { title: "Building…" };

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
      />
      <Footer />
    </>
  );
}
