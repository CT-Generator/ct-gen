// Zine Footer — credits + funding line + nav links in zine type.
// Cool blue links, label-style nav row.
// Spec: zine-design-system / Requirement: Footer.

import Link from "next/link";
import { readLocale, getDict, localizedHref } from "@/lib/i18n";

export async function Footer() {
  const locale = await readLocale();
  const t = getDict(locale).footer;
  return (
    <footer
      className="mt-12 sm:mt-16"
      style={{
        borderTop: "2.5px solid var(--ink)",
        background: "color-mix(in oklab, var(--paper) 75%, var(--paper-2))",
      }}
    >
      <div
        className="mx-auto px-[var(--stage-pad-x)] py-6 sm:py-8"
        style={{ maxWidth: "var(--stage-max)" }}
      >
        <nav
          className="flex flex-wrap gap-x-5 gap-y-2"
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
          }}
        >
          <Link href={localizedHref("/recipe", locale)} style={{ color: "var(--cool)", textDecoration: "none" }} className="hover:underline">
            {t.link_recipe}
          </Link>
          <Link href={localizedHref("/teach", locale)} style={{ color: "var(--cool)", textDecoration: "none" }} className="hover:underline">
            {t.link_teach}
          </Link>
          <Link href={localizedHref("/about", locale)} style={{ color: "var(--cool)", textDecoration: "none" }} className="hover:underline">
            {t.link_about}
          </Link>
          <Link href={localizedHref("/imprint", locale)} style={{ color: "var(--cool)", textDecoration: "none" }} className="hover:underline">
            {t.link_imprint}
          </Link>
          <Link href={localizedHref("/privacy", locale)} style={{ color: "var(--cool)", textDecoration: "none" }} className="hover:underline">
            {t.link_privacy}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
