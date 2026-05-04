## Why

The deployed app at conspiracy-generation.streamlit.app is broken: Streamlit Community Cloud's base image moved to Debian trixie, which dropped the `wkhtmltopdf` system package (the project was archived upstream in Jan 2023). Our `packages.txt` pins `wkhtmltopdf`, so `apt-get install` fails with "no installation candidate", which surfaces in the UI as "Error installing requirements." The dependency is only used by two "Download as JPG" buttons on the final page — a nice-to-have on top of the core flow. Removing them is the smallest path to restoring the deploy.

## What Changes

- **BREAKING (user-facing):** Remove the "Download Selections Image" and "Download Conspiracy Theory Image" buttons from page 5.
- Remove `wkhtmltopdf` from `packages.txt` (and delete the file if it becomes empty).
- Remove `imgkit==1.2.3` from `requirements.txt`.
- Remove `ct_gen/src/modules/markdown_functions.py` (only contains `markdown_to_image`, no other callers).
- Remove the two `markdown_to_image(...)` calls and `selections_merger(...)` helper in `ct_gen/src/pages/page_5.py`.
- Remove the now-unused CSS files under `ct_gen/data/css/` that only fed `markdown_to_image` (`CT-img.css`, `selections-img.css`).
- The Twitter share button, Google Sheets logging, ratings, and on-screen rendering of the conspiracy theory all stay.

## Capabilities

### New Capabilities
- `conspiracy-output`: Defines what the final page exposes to the user after a conspiracy theory is generated — the on-screen rendering, the Twitter share, the Google Sheets persistence, and the rating capture. Explicitly excludes any image/PDF download.

### Modified Capabilities
<!-- None — this is the project's first OpenSpec change; no existing specs to amend. -->

## Impact

- **Code:** `app.py` unchanged. `ct_gen/src/pages/page_5.py` shrinks (~30 lines removed). `ct_gen/src/modules/markdown_functions.py` deleted. CSS files under `ct_gen/data/css/` deleted.
- **Dependencies:** `imgkit` (Python) and `wkhtmltopdf` (apt) removed. No new dependencies.
- **Deployment:** Unblocks Streamlit Cloud build on Debian trixie. No infra changes required.
- **User experience:** Loses two download buttons on the final page. Twitter share and ratings remain. The on-page rendering of the conspiracy theory is unchanged.
- **Data:** No change to Google Sheets schema or logged columns.
