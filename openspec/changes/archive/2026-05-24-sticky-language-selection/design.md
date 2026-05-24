## Context

Locale resolution lives in three places today:

1. **`web/middleware.ts`** runs on every non-asset request. It resolves the locale (explicit prefix → cookie → Accept-Language → `en`), sets the `x-locale` request header, and writes `cgen_lang` whenever the resolved locale differs from the cookie.
2. **`web/lib/i18n/index.ts#readLocale`** reads `x-locale` in server components and returns it to callers.
3. **`web/components/zine/topbar-client.tsx`** writes `cgen_lang` from the browser when the user clicks the locale toggle, *and* navigates to `localizedHref(currentPath, target)`.

Two pages — `/g/[id]` and `/story/[uuid]` — additionally compare the visitor's locale (from `readLocale()`) to the row's persisted locale and `redirect()` to the row's locale URL when they differ. This redirect was added to make the URL bar match the rendered chrome, but it has an under-discussed side-effect: the redirected request is now `/de/...`, and middleware writes `cgen_lang=de` on it. The visitor's *previous* explicit choice is silently overwritten.

The bug surface the user reports is downstream of this overwrite: after one foreign-language permalink view, every menu item is now in the wrong language because the masthead's `localizedHref` calls are seeded with `de` (from cookie via middleware), so "Recipe" becomes `/de/recipe`, "Teach" becomes `/de/teach`, and so on.

## Goals / Non-Goals

**Goals:**

- The `cgen_lang` cookie reflects exactly one thing: the visitor's most recent **explicit** language choice (via the locale toggle), or — if they've never clicked the toggle — the locale they were first imprinted with on first visit.
- After the first visit, no in-app navigation, no permalink click, and no row-locale alignment ever rewrites the cookie. Only the toggle does.
- Chrome (masthead + footer + nav links + locale toggle hrefs) on every page reflects the cookie locale — even on permalink pages whose *content* is in a different locale.
- Content rendered from persisted rows (`generations.recipeContent`, story seeds, build wizard step text) continues to render in the row's locale, because that's how it was authored and translation isn't free.
- `<html lang>` aligns with the language of the page's *content*, since that's what assistive tech needs to announce. On permalink pages, `<html lang>` therefore follows the row locale, not the cookie. (Chrome strings sit inside that `<html lang>`, mixed-language — acceptable; this is the same situation a German user has today when viewing English Wikipedia chrome around a German quote.)
- First-time Accept-Language imprint behavior is preserved exactly.

**Non-Goals:**

- We do not introduce a separate "content locale" header. The row's locale is already on the row; pages read it directly. Middleware continues to set exactly one header: `x-locale = chrome locale`.
- We do not auto-translate row content into the visitor's chosen language. The row stays in the language it was authored in.
- We do not add a "you are viewing this in [X]" banner on permalink pages. The toggle in the masthead already shows the chrome locale; the H1 / content language is self-evident.
- We do not change the URL prefix scheme. `/de/`, `/nl/`, and un-prefixed-English remain the three URL shapes.
- We do not rework dictionary lookup, missing-key handling, or the no-English-fallback rule.

## Decisions

### Decision 1: Cookie is written in exactly two code paths

**What**: The cookie is written from (a) middleware, only on the first request where no cookie exists yet (the Accept-Language imprint), and (b) the masthead locale toggle, when the user clicks a non-active pill.

**Why**: Today middleware writes the cookie on *any* request where the resolved locale differs from the cookie. That includes the redirected `/de/g/<id>` request that follows the permalink-redirect. By narrowing the write to "no cookie" + "user clicked toggle," we make the cookie a faithful record of explicit intent.

**Alternatives considered**:
- Detect the *source* of the request (was this a redirect from a permalink page?) and skip the write. Rejected — fragile, requires a side-channel header, hard to test.
- Write the cookie only on toggle clicks, never in middleware. Rejected — the first-visit imprint is the one case where the server *should* set a default the client can later read.

### Decision 2: Drop the row-locale URL redirect on permalink pages

**What**: Remove the `if (visitorLocale !== rowLocale) redirect(...)` block in `/g/[id]/page.tsx` and `/story/[uuid]/page.tsx`. Instead, render the page in place:

- The page's `<html lang>` follows the **row** locale.
- The page's body content (paragraphs, headlines composed from seed values) follows the **row** locale.
- The masthead, footer, and every navigation link (including the locale toggle) follow the **chrome** locale read from `cgen_lang`.

**Why**: The redirect existed to make URL + chrome + content all agree on one locale. That guarantee is now relaxed: URL + content agree (the URL prefix is part of the row's permalink); chrome may diverge to honor the visitor's UI preference. Without the redirect, the cookie-overwrite chain is broken at the source.

**Consequence**: A user with `cgen_lang=en` who clicks a shared `/de/g/abc123` link will see:
- German URL bar (`/de/g/abc123`).
- German H1 and content (because the row was authored in German).
- English masthead, English locale toggle (with DE not active — visitor's choice is EN), English Recipe/Teach/About links that go to `/recipe`, `/teach`, `/about`.

The `<html lang>` is `de` so a screen reader announces the German content correctly; the chrome strings inside it are English, which is the same mixed-language scenario any embedded quote produces.

**Alternatives considered**:
- Keep the redirect but unset the cookie write in middleware. Rejected — the URL changes anyway, which is confusing for share/copy behavior, and the chrome still ends up in the row's locale because the masthead reads `readLocale()` (which reads `x-locale`, which still resolves to the URL prefix). Two changes to fix one bug; cleaner to just drop the redirect.
- Add a `?chrome=en` query param so chrome can override what middleware computed. Rejected — URLs get ugly, and `cgen_lang` already exists for this exact purpose.

### Decision 3: Middleware resolves chrome locale from cookie first, prefix only when no cookie

**What**: The resolution order in middleware becomes:

1. `cgen_lang` cookie if present and valid.
2. URL prefix (`/de/` or `/nl/`) if no cookie.
3. Accept-Language if no cookie and no prefix.
4. `en`.

This is a reordering of step 1 and 2 from today's spec. Today: prefix wins over cookie. Tomorrow: cookie wins over prefix (for the *chrome* locale; URL prefix still determines path rewriting and is still what the user typed).

**Why**: The user's cookie is their explicit choice; the URL prefix may have been received from a shared link they didn't author. The cookie should win.

**Note**: The path is still rewritten when an explicit prefix is present (i.e., `/de/recipe` still serves the same `app/recipe/page.tsx` file). The prefix governs **routing**; the cookie governs **chrome locale**. These two concepts split.

**Alternatives considered**:
- Keep prefix-wins-over-cookie for backwards compatibility. Rejected — that's exactly the behavior that creates the bug.
- Use prefix-wins for `/` (toggle navigation) but cookie-wins for permalinks (`/g/`, `/story/`). Rejected — different rules for different paths is a maintenance burden and is also fragile against future routes. One rule for all paths.

### Decision 4: The locale toggle continues to navigate to the prefixed equivalent

**What**: Clicking "DE" from `/recipe` still navigates to `/de/recipe` and clicking "EN" from `/nl/recipe` still navigates to `/recipe`. The toggle writes the cookie to the chosen locale *before* it triggers navigation (existing client-side `writeLocaleCookie` already does this).

**Why**: The toggle's intent is "I want to read this whole site in language X." Both the cookie and the URL change. After the toggle click, on the new page, middleware reads cookie=X (matches), URL prefix=X (matches), and chrome locale is X.

**No change here** — this is already what the topbar-client does. It's called out explicitly to make clear that the toggle is the *only* code path that simultaneously updates the cookie and the URL.

### Decision 5: `<html lang>` on permalink pages follows row locale; on every other page it follows chrome locale

**What**: A new helper or per-page logic sets `<html lang>` from row locale where a row drives the page (`/g/[id]`, `/story/[uuid]`, `/build/[id]` — when the build's stitched output is shown), and from chrome locale everywhere else.

**Why**: Assistive tech reads `<html lang>` to choose pronunciation rules. On a German-content page rendered with English chrome, German is still the dominant language by word count and is the language of the *meaning* — the chrome is interactive scaffolding. Setting `lang="de"` keeps the screen-reader pronouncing the content correctly; the few English chrome strings will be mis-pronounced but they are minimal and structural ("Recipe", "About") so the cost is small.

**Alternatives considered**:
- Always `lang=chromeLocale`. Rejected — a German screen reader user would hear English pronunciation rules applied to a German story.
- Wrap chrome strings in `<span lang="en">`. Possible, but invasive (every masthead string would need wrapping) and out of scope for this change.

### Decision 6: First-visit Accept-Language imprint is unchanged

**What**: When middleware sees a request with no `cgen_lang` cookie and no URL prefix, it parses Accept-Language; if it points to a supported non-English locale, the response sets the cookie to that locale and redirects `/` to `/<locale>/`. Permalink paths (`/g/`, `/story/`) skip this redirect (same as today).

**Why**: This is the one case where the server should imprint a sensible default the user hasn't picked yet. After this single imprint, only the toggle can change the cookie.

**No change here** — the behavior is preserved.

## Risks / Trade-offs

- **[Mixed-language pages on permalink visits]** A non-trivial number of users will see chrome and content in different languages. This is a deliberate trade-off; the alternative (the current behavior) silently changes their UI language. We are choosing visible mixed-language over invisible flipping. → Mitigation: document this in the spec scenarios so it's not regressed. Consider a small caption like "Story authored in German" later if it confuses users; do not add it now.
- **[`<html lang>` differs from masthead text language]** Screen readers may mis-pronounce chrome strings. Strings are short and structural; cost is small. → Mitigation: log the trade-off; revisit if accessibility feedback comes in.
- **[Visitor analytics ambiguity]** `page_views.locale` now reliably reflects the visitor's chrome locale, which means "this page was viewed by a user with cookie=de" — *not* "this page was the German version of /recipe". Top-pages charts already strip URL prefixes (per existing spec); this change does not affect that. → Mitigation: no schema change; this is a clarification of interpretation only.
- **[Existing inbound links to `/de/g/abc` for an EN row]** Some shares already exist in the wild. Behavior changes: they no longer redirect to `/g/abc`; they render at `/de/g/abc` with German URL + English row content + English chrome (visitor's choice). Old shares of `/de/g/abc` for a *DE* row continue to work as before. → Mitigation: acceptable; old behavior was a bug.
- **[Test surface]** Middleware tests, permalink-page tests, and toggle interaction tests all need updates. → Mitigation: tasks.md sequences these explicitly.

## Migration Plan

This is a code-only change. Steps:

1. Update `web/middleware.ts` to (a) resolve cookie-before-prefix, (b) write cookie only when none exists, (c) still set `x-locale` to the resolved chrome locale, (d) still rewrite `/de/foo` → `/foo` so the same page file renders.
2. Remove the `redirect()` block in `/g/[id]/page.tsx` and `/story/[uuid]/page.tsx`. Thread `rowLocale` (for content) and `chromeLocale = await readLocale()` (for masthead/nav) through the components.
3. Update root layout to set `<html lang>` from a per-route override when one is provided (rowLocale on permalink pages, chromeLocale otherwise).
4. Update tests.
5. Sanity-check the visitor flow manually: log in as EN, click a `/de/g/<id>` link, confirm cookie stays `en`, confirm Recipe link goes to `/recipe`.

Rollback: revert the commits; the middleware and page files are the only surfaces touched.

## Open Questions

- None — the two product decisions ("foreign permalink keeps visitor's UI" and "first-load = Accept-Language → English fallback") were confirmed by the user before this design was written.
