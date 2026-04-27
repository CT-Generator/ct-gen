## 1. Strip image-rendering code

- [x] 1.1 Remove the `from ct_gen.src.modules.markdown_functions import markdown_to_image` import from `ct_gen/src/pages/page_5.py`
- [x] 1.2 Remove the `selections_merger()` function from `ct_gen/src/pages/page_5.py` (its only caller is the download button being removed)
- [x] 1.3 Remove the two `markdown_to_image(...)` calls and the surrounding `### Download images & Share` markdown header, two-column layout, and both `st.download_button` widgets from `display_page_5()` in `ct_gen/src/pages/page_5.py` (the Twitter share column above stays)
- [x] 1.4 Delete `ct_gen/src/modules/markdown_functions.py`

## 2. Strip dependencies

- [x] 2.1 Remove the `imgkit==1.2.3` line from `requirements.txt` (also removed from `current_requirements.txt` snapshot)
- [x] 2.2 Delete `packages.txt` (its only entry was `wkhtmltopdf`)
- [x] 2.3 Delete `ct_gen/data/css/CT-img.css`
- [x] 2.4 Delete `ct_gen/data/css/selections-img.css`

## 3. Verify

- [x] 3.1 Confirm with `grep` that no remaining file references `imgkit`, `wkhtmltopdf`, `markdown_to_image`, `selections_merger`, `CT-img.css`, or `selections-img.css` (clean outside the change's own artifacts)
- [x] 3.2 Create a clean Python 3.10 venv (matching the Streamlit Cloud setting), `pip install -r requirements.txt`, and confirm it succeeds without imgkit (succeeded; pre-existing yank warning on `aiohttp==3.11.14` noted, out of scope)
- [x] 3.3 Run `streamlit run app.py` locally with valid OpenAI + Google Sheets secrets and walk through pages 1 → 5; confirm theory generation streams, the disclaimer appears, the Twitter share button renders, the rating buttons render, and no download buttons appear (boot-only smoke test: server boots clean, /health = ok, app.py imports succeed, Sheets auth verified read-only against `generated_ct` and `ratings`. Visual click-through skipped per user decision; will rely on live Streamlit Cloud verification)
- [x] 3.4 Confirm the `generated_ct` row is appended exactly once and clicking "Recreate your conspiracy theory" does not produce a duplicate row (verified by code review: the `if st.session_state["ct_saved"] == False` guard wrapping the single `insert_row_to_sheet` call is unchanged; "Recreate" only calls `generate_conspiracy_theory.clear()` and re-runs generation, no second insert path)

## 4. Ship

- [ ] 4.1 Commit on a feature branch with a message referencing this change name
- [ ] 4.2 Open a PR; once merged to `main`, watch the Streamlit Cloud build log
- [ ] 4.3 Confirm the live app loads at `https://conspiracy-generation.streamlit.app` without "Error installing requirements"
- [ ] 4.4 Run `openspec archive remove-image-downloads` after the live deploy is verified green
