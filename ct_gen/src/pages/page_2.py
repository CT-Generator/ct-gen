import streamlit as st

#from initialize_session_state import initialize_session_state_dict
import pandas as pd
import toml

from ct_gen.src.modules.google_sheets_api import load_google_sheets_data

# Load the secrets from the secrets.toml file
secrets = toml.load(".streamlit/secrets.toml")



# Contents for page 2
def display_page_2():
    
    st.markdown("### Page 2")
    st.warning('DISCLAIMER: DISCLAIMER: False conspiracy theories can be harmful. Please use our Conspiracy Generator with caution and do not target vulnerable groups of individuals.', icon="⚠️")
    st.title("🔦 The Official Version")
    st.subheader("Article Scraper")
    st.markdown("What’s your conspiracy about? Every conspiracy theories starts from an official version of events")
    #st.session_state["url"] = st.text_input("Enter url", placeholder="Paste URL and Enter", value=st.session_state["url"])

    # Load data from Google Sheets
    df = load_google_sheets_data()
    
    # Display the dropdown menu with "Official_Version" contents
    selected_version = st.selectbox("Select an Official Version:", df["Official_Version"])
    
    # Display the selected content
    if selected_version:
        selected_article_url = df.loc[df["Official_Version"] == selected_version, "News_Source"].values[0]
        selected_article_content = df.loc[df["Official_Version"] == selected_version, "Official_Version"].values[0]
        
        st.subheader("Article Summary")
        st.write(selected_article_content)
        
        st.subheader("Article URL")
        st.write(f"[Read more]({selected_article_url})")

        # Store the selected content in session state
        st.session_state.selected_version = selected_version
        st.session_state.selected_article_url = selected_article_url
        st.session_state.selected_article_content = selected_article_content

