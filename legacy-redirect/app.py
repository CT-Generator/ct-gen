"""
Conspiracy Generator — legacy URL redirect stub.

Deployed to Streamlit Community Cloud at https://conspiracy-generation.streamlit.app
so existing tweets, blog links, and bookmarks keep working after the v2 cutover.

Spec: openspec/changes/v2-rebuild/specs/legacy-redirect/spec.md

Deliberately tiny. The previous Streamlit app broke because Streamlit Cloud's
base image dropped a system package; this stub takes only `streamlit` and no
apt packages so it cannot break the same way.
"""

import streamlit as st

NEW_BASE_URL = "https://conspiracy-generator.duckdns.org"

st.set_page_config(
    page_title="Conspiracy Generator — we've moved",
    page_icon="❓",
    layout="centered",
    initial_sidebar_state="collapsed",
)

# Forward any path the visitor came in on.
qp = st.query_params
qp_str = "&".join(f"{k}={v}" for k, v in qp.items())
target = NEW_BASE_URL + (("?" + qp_str) if qp_str else "")

st.markdown(
    f"""
    <meta http-equiv="refresh" content="0; url={target}">
    <script>window.location.replace({target!r});</script>
    <style>
      body {{
        background: #F6F2EA;
        color: #1B1A1F;
        font-family: 'Inter Tight', system-ui, sans-serif;
      }}
      .stApp {{ background: #F6F2EA; }}
      h1 {{
        font-family: Fraunces, Georgia, serif;
        font-weight: 600;
        letter-spacing: -0.02em;
      }}
    </style>
    """,
    unsafe_allow_html=True,
)

st.title("We've moved.")
st.write(
    "Conspiracy Generator now lives at a new home. If you aren't redirected automatically:"
)
st.markdown(f"**[Open the new site →]({target})**")
st.caption("Same recipe, sharper edges. Boudry · Meyer · Ghent · Hamburg.")
