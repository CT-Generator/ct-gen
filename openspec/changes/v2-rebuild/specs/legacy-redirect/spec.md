## ADDED Requirements

### Requirement: Streamlit Cloud stub redirects to new domain

The legacy URL `https://conspiracy-generation.streamlit.app` SHALL continue to resolve and SHALL redirect every visitor to the new production domain. Because Streamlit Cloud cannot serve a server-side 301, the redirect MUST be implemented as a minimal Streamlit `app.py` that emits an HTML `<meta http-equiv="refresh">` tag, a `window.location.replace(...)` script, and a visible fallback link.

#### Scenario: Visitor lands on legacy URL
- **WHEN** any visitor opens `https://conspiracy-generation.streamlit.app`
- **THEN** within 1 second the browser navigates to the new domain
- **AND** if JavaScript is disabled, the meta-refresh fires within 3 seconds
- **AND** if both fail, a visible "We've moved to <new URL>" link is rendered for manual click

### Requirement: Stub has zero non-stdlib dependencies beyond Streamlit

The redirect Streamlit app SHALL have a `requirements.txt` containing only `streamlit` (no version pin; latest accepted) and a `packages.txt` that does NOT exist. This minimizes the chance of the stub itself breaking from base-image churn.

#### Scenario: Stub install audit
- **WHEN** Streamlit Cloud rebuilds the stub from a fresh base image
- **THEN** `pip install -r requirements.txt` succeeds with only Streamlit and its transitive deps
- **AND** there is no `packages.txt`
- **AND** the build completes without invoking apt-get for any custom system package

### Requirement: Permalink URL preservation

Where possible, the legacy redirect SHALL preserve any path or query string from the legacy URL when forwarding to the new domain, so a hypothetical legacy permalink format (if any was ever live) maps to its v2 equivalent. If no mapping exists, the redirect lands on the v2 home.

#### Scenario: Visitor hits legacy URL with path
- **WHEN** a visitor opens `https://conspiracy-generation.streamlit.app/somepath`
- **THEN** the redirect target is `https://<new-domain>/somepath`
- **AND** if no v2 route matches that path, the v2 app serves a 404 page that includes a link to the v2 home

### Requirement: Graceful degrade when JS is disabled

The stub SHALL render a visible, non-JS-dependent body containing a brief "We've moved" message and a clickable link to the new domain. The page MUST NOT trap users on a blank screen if JavaScript fails.

#### Scenario: Visitor with JS disabled
- **WHEN** a visitor with JavaScript disabled opens the legacy URL
- **THEN** the meta-refresh fires within 3 seconds
- **AND** during that 3-second window the visitor sees the "We've moved" text and a clickable link to the new URL
