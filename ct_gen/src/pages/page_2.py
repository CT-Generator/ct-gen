import streamlit as st

import newspaper
from newspaper import Article

import pandas as pd
import random  # Import the random module
import toml

from ct_gen.src.modules.google_sheets_api import load_google_sheets_data


# Load the secrets from the secrets.toml file
secrets = toml.load(".streamlit/secrets.toml")
    
# Cache the stories to prevent reloading every time
@st.cache_data(ttl=3600, show_spinner=False)  # Cache for an hour
def get_random_stories():
    df = load_google_sheets_data("news")
    random_stories = df["Official_Version"].sample(3).tolist()
    return random_stories

def display_page_2():
    
    st.markdown("### Step 1")
    
    st.title("📰 The Official Version")
    st.info("What’s your conspiracy about? Every conspiracy theory starts from an official version of events. Below, we have randomly selected some recent news stories. Select one or click refresh to sample new articles.")

    # Custom CSS for full-width buttons
    st.markdown("""
    <style>
        .stButton>button {
            width: 100%;
        }
    </style>
    """, unsafe_allow_html=True)

    # Fetch the random stories (this will use the cached data unless the cache is cleared)
    random_stories = get_random_stories()

    # Display the random stories as buttons
    st.write("Click on an official story to see the summary below:")
    story_selected = None
    for story in random_stories:
        if st.button(story):
            story_selected = story

    # Add the reload button
    if st.button("Load New Stories"):
        st.cache_data.clear()  # Clear the cache data
        st.experimental_rerun()  # Rerun the app

    # Input field for users to enter a custom URL
    
    #url = st.text_input("Paste the web address of a newspaper article to see the summary below:", placeholder="Paste URL and Enter")

    df = load_google_sheets_data("news")  # Load data directly for selected stories

    # Handling the story selection from the buttons
    if story_selected:
        selected_article_url = df.loc[df["Official_Version"] == story_selected, "News_Source"].values[0]
        selected_article_content = df.loc[df["Official_Version"] == story_selected, "Summary"].values[0]

        # Store the selected content in session state
        st.session_state.selected_version = story_selected
        st.session_state.selected_article_url = selected_article_url
        st.session_state.selected_article_content = selected_article_content

        # Display the selected article summary
        st.subheader("Article Summary")
        st.write(st.session_state.selected_article_content)
        st.write(f"[Read more]({st.session_state.selected_article_url})")
