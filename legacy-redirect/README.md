# `legacy-redirect/` — Streamlit Cloud stub

A 30-line Streamlit app whose only job is to redirect every visitor of `https://conspiracy-generation.streamlit.app` to the new v2 domain.

## Deploying

This directory should live in **its own GitHub repo** that Streamlit Cloud points at. Don't deploy it from the main `ct-gen` repo — Streamlit Cloud builds the whole repo, and we don't want it pulling Next.js / TypeScript / etc. into a redirect stub.

Recommended:

```bash
# Create a fresh repo for the stub
mkdir cgen-legacy-redirect && cd cgen-legacy-redirect
git init
cp /path/to/ct-gen-1/legacy-redirect/* .
git add . && git commit -m "init redirect stub"
gh repo create CT-Generator/cgen-legacy-redirect --public --push --source=.
```

Then in Streamlit Cloud:

1. **Settings → Manage app → Source** → point at the new repo.
2. **Settings → General → Custom subdomain** → `conspiracy-generation`.
3. Redeploy.

## Why no `packages.txt`?

The previous app's `packages.txt` listed `wkhtmltopdf`, which Debian removed. With nothing in `packages.txt` (or no file at all), there is no apt step that can fail. The pure-Python `streamlit` install is the entire dependency chain.

## Why pin no versions?

Same reason: every pinned version is a future bug waiting for an upstream change. `requirements.txt: streamlit` will resolve to whatever Streamlit Cloud's environment supports.

## Maintenance

A monthly GitHub Action that runs `gh workflow run --ref main rebuild` (an empty no-op commit on main) keeps the build fresh enough that base-image changes never accumulate into a hard break. If Streamlit Cloud ever does break the stub, the URL fails open to a 5xx and visitors lose the redirect — but the stub itself is so small that fixing it is a 5-minute job.
