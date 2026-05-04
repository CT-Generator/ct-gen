## Context

`conspiracy-generation.streamlit.app` currently shows "Error installing requirements." The Streamlit Cloud build log shows `apt-get` failing on `wkhtmltopdf` in `packages.txt`:

```
E: Package 'wkhtmltopdf' has no installation candidate
```

The cause is environmental, not a code regression. Streamlit Community Cloud's base image was rebased (bullseye → bookworm/trixie) sometime between the last successful deploy (2025-03-21) and the dependabot redeploy on 2026-02-18. Debian dropped `wkhtmltopdf` starting with bookworm because the upstream project was archived in January 2023 (the codebase depended on a long-deprecated Qt4/WebKit fork that the maintainers could no longer support). The package is not coming back.

`wkhtmltopdf` is used in exactly one place: `markdown_to_image()` in `ct_gen/src/modules/markdown_functions.py`, which shells out via the `imgkit` Python wrapper. It's invoked twice on page 5 to populate two `st.download_button` widgets that let the user download the generated conspiracy theory and their selection panels as JPGs. Nothing else in the app touches it.

The decision space is essentially: keep the image-export feature on a different rendering pipeline, or drop it. The user has chosen to drop it.

## Goals / Non-Goals

**Goals:**
- Restore a successful Streamlit Cloud deploy with the smallest possible diff.
- Remove every transitive reference to `imgkit` / `wkhtmltopdf` so the codebase doesn't pretend the feature still exists.
- Preserve the rest of the page 5 experience: on-screen rendering, Twitter share, Google Sheets logging, ratings.

**Non-Goals:**
- Replacing the image download with a different download (PDF, Pillow-rendered JPG, etc.). Out of scope for this change; can be a future proposal.
- Modernizing the OpenAI SDK (currently `openai==0.28.1`). Still functional; not blocking.
- Bumping `streamlit==1.25.0` or other pinned versions. Not blocking the deploy.
- Changing what gets logged to Google Sheets.

## Decisions

**Decision 1: Remove the feature rather than replace it.**
Replacing would mean introducing one of: WeasyPrint (HTML→PDF, pure-Python but adds new system deps like cairo/pango), Playwright (heavy browser install at startup, fragile on Streamlit Cloud), or Pillow's `ImageDraw` (loses CSS styling, requires manual layout). Each carries either a deploy-fragility risk or a quality regression. The download buttons sit alongside an already-working Twitter share, so the loss of function is bounded. Removing is reversible — the git history preserves the imgkit-based implementation if we want to bring it back differently.

**Decision 2: Delete `markdown_functions.py` outright instead of leaving a stub.**
The module contains only `markdown_to_image`. After removal it's dead. Leaving an empty file or a stub raising `NotImplementedError` invites future confusion. The two import lines that reference it (`page_5.py:12`) get removed in the same change.

**Decision 3: Delete the unused CSS files (`CT-img.css`, `selections-img.css`) under `ct_gen/data/css/`.**
These files only existed to feed `imgkit`. With the function gone they have no readers. We'll verify before deleting — if either is referenced elsewhere (e.g., by Streamlit's `st.markdown(..., unsafe_allow_html=True)` blocks), we keep it.

**Decision 4: Keep `Pillow==9.5.0` pinned.**
Pillow is still imported transitively (e.g., by `streamlit`/`matplotlib`). Don't touch it in this change. If a separate Python-version bump ever happens, Pillow will need updating then; that's a different proposal.

**Decision 5: Delete `packages.txt` entirely if `wkhtmltopdf` is its only line.**
An empty `packages.txt` is harmless but clutters the repo. The current file contains only `wkhtmltopdf`, so deleting it is the cleaner outcome.

## Risks / Trade-offs

- **[Risk] Some user has a workflow that relies on the JPG download.** → Low likelihood (no analytics suggest it), but the loss is real. Mitigation: this is reversible via git; a follow-up change can restore the feature on a different rendering pipeline (likely WeasyPrint → PDF) if demand surfaces.
- **[Risk] An unrelated package or system dep also broke during the same image rebase, masked behind the wkhtmltopdf failure.** → Mitigation: redeploy locally against Python 3.10 with `pip install -r requirements.txt` before merging, and watch the live Streamlit Cloud logs after deploy; if a second error surfaces, address it as a follow-up.
- **[Trade-off] Twitter share button still references "Twitter" branding even though X has rebranded.** → Out of scope. Pre-existing.
- **[Trade-off] We're not modernizing `openai==0.28.1` even though the SDK is years old.** → Out of scope; verified working in this exploration. Belongs in a separate proposal.

## Migration Plan

1. Edit `ct_gen/src/pages/page_5.py`:
   - Remove `from ct_gen.src.modules.markdown_functions import markdown_to_image` (line 12).
   - Remove the `selections_merger()` function (lines 15–31) — its only caller is the now-removed download button.
   - Remove the two `st.download_button` calls and the surrounding header/columns block (lines 200–213).
2. Delete `ct_gen/src/modules/markdown_functions.py`.
3. Delete `ct_gen/data/css/CT-img.css` and `ct_gen/data/css/selections-img.css` (after confirming nothing else references them).
4. Edit `requirements.txt`: remove the `imgkit==1.2.3` line.
5. Delete `packages.txt`.
6. Local smoke test on Python 3.10 (matches Streamlit Cloud setting): `streamlit run app.py` and walk through pages 1–5 to confirm generation still works.
7. Commit and push to `main`. Streamlit Cloud auto-redeploys.
8. Watch the build log; confirm "Your app is live."

**Rollback:** revert the merge commit. Streamlit Cloud will redeploy from the previous tip, which already fails — so rollback only makes sense if the new code introduces a *new* failure mode beyond the old one. In that case, immediate revert + investigate.

## Open Questions

- None blocking. If a future change wants the download feature back, the strongest candidate is WeasyPrint → PDF rather than reintroducing wkhtmltopdf.
