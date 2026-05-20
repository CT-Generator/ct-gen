// 404 fallback — zine style.

import { Masthead } from "@/components/masthead";
import { Footer } from "@/components/footer";
import { BtnLink } from "@/components/zine/btn";
import { Sticker } from "@/components/zine/sticker";
import { readLocale, getDict, localizedHref } from "@/lib/i18n";

export default async function NotFound() {
  const locale = await readLocale();
  const t = getDict(locale).errors;

  return (
    <>
      <Masthead />
      <article className="stage">
        <Sticker color="hot" tilt={-3}>404</Sticker>
        <h1
          className="scream"
          style={{ fontSize: "var(--t-scream-xl)", margin: "14px 0 16px" }}
        >
          {t.not_found_h1}
        </h1>
        <p
          className="body"
          style={{ fontSize: "var(--t-body-lg)", lineHeight: 1.55, maxWidth: 640 }}
        >
          {t.not_found_body}
        </p>
        <div style={{ marginTop: 28 }}>
          <BtnLink href={localizedHref("/", locale)} variant="hot">
            ← {t.not_found_back_home}
          </BtnLink>
        </div>
      </article>
      <Footer />
    </>
  );
}
