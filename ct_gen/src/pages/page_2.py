import streamlit as st

import newspaper
from newspaper import Article

import pandas as pd
import random  # Import the random module
import toml

from ct_gen.src.modules.google_sheets_api import load_google_sheets_data
from ct_gen.src.modules.image_functions import *


# Load the secrets from the secrets.toml file
secrets = toml.load(".streamlit/secrets.toml")
    
# Cache the stories to prevent reloading every time
@st.cache_data(ttl=3600, show_spinner=False)  # Cache for an hour
def get_random_stories():
    df = load_google_sheets_data("news")
    random_stories = df["Official_Version"].sample(3).tolist()
    return random_stories

def display_page_2():
    
    
    news_df = load_google_sheets_data("news")
    random_news = select_random_file_names("ct_gen/data/images/news", n_random_files=3, change_tracker = st.session_state["change_tracker"])
    images = load_images(folder_path="ct_gen/data/images/news", file_names=random_news)
    
    st.markdown("<h1 style='text-align: center;'>The Official Version</h1>", unsafe_allow_html=True)
    st.info("What’s your conspiracy about? Every conspiracy theory starts from an official version of events. Below, we have randomly selected some recent news stories. Select one or click refresh to sample new articles.")
    
    
    selected_news = display_image_options(images, random_news, key="news")
    
    
    if selected_news:

        st.session_state["story_selected"] = selected_news
        st.write(selected_news)
        st.session_state["selected_article_content"] = news_df[news_df["Official_Version"] == selected_news.replace("_", "'")]["Summary"].iloc[0]
        
        if (st.session_state["story_selected"] != "") and (st.session_state["selected_article_content"] != ""):
            
            col1, col2, col3 = st.columns([0.25, 0.55, 0.2])
            col1.markdown(f"### {st.session_state.story_selected}")
            col2.info(st.session_state.selected_article_content)
            col3.text("")
            load_more_button_1 = col3.button("load more", "load_more_button_1")
            if load_more_button_1:
                st.session_state["change_tracker"] = st.session_state["change_tracker"] + 1
                st.experimental_rerun()

    else:
        
        st.markdown(" ")
        st.warning("Select a news story")
        st.markdown(" ")
        st.markdown(" ")
        load_more_button_2 = st.button("load more", "load_more_button_2")
        if load_more_button_2:
            st.session_state["change_tracker"] = st.session_state["change_tracker"] + 1
            st.experimental_rerun()
        