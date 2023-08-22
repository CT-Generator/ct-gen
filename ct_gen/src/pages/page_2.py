import streamlit as st

import newspaper
from newspaper import Article

#from initialize_session_state import initialize_session_state_dict
import pandas as pd
import random  # Import the random module
import toml

from ct_gen.src.modules.google_sheets_api import load_google_sheets_data

# Load the secrets from the secrets.toml file
secrets = toml.load(".streamlit/secrets.toml")



#Contents for page 2
def display_page_2():
    
    st.markdown("### Page 2")
    st.warning('DISCLAIMER: DISCLAIMER: False conspiracy theories can be harmful. Please use our Conspiracy Generator with caution and do not target vulnerable groups of individuals.', icon="⚠️")
    st.title("📰 The Official Version")
    st.info("What’s your conspiracy about? Every conspiracy theory starts from an official version of events.")
    st.divider()
    #st.subheader("Article Scraper")
    
    col_1, col_2 = st.columns(2)
    
    # Display buttons for selecting stories
    df = load_google_sheets_data()
    story_options = df["Official_Version"].tolist()
    selected_story = st.selectbox("Select a story:", story_options)
    
    # Display a text input for entering a URL
    url = st.text_input("Or enter your URL:", placeholder="Paste URL and Enter")
    
    if url:
        st.session_state.user_input_page_2 = url
        
        # Scrape and display the article content based on the URL
        article = Article(url)
        article.download()
        article.parse()
        article.nlp()  # Use newspaper3k's natural language processing
        
        # Display the article content from pasted URL
        st.subheader("Article Content")
        st.write(article.summary)  # Display the summarized text of the article
        
        # Store the pasted URL in session state
        st.session_state.selected_version = None
        st.session_state.selected_article_url = url
        st.session_state.selected_article_content = article.summary
        
    elif selected_story:
        selected_article_url = df.loc[df["Official_Version"] == selected_story, "News_Source"].values[0]
        selected_article_content = df.loc[df["Official_Version"] == selected_story, "Summary"].values[0]
        
        # Store the selected content in session state
        st.session_state.selected_version = selected_story
        st.session_state.selected_article_url = selected_article_url
        st.session_state.selected_article_content = selected_article_content
    
    # Display the selected article summary if a story is selected
    if hasattr(st.session_state, 'selected_article_content'):
        st.subheader("Article Summary")
        st.write(st.session_state.selected_article_content)
        st.write(f"[Read more]({st.session_state.selected_article_url})")

# Contents for page 2

# def display_page_2():
#     st.warning('DISCLAIMER: False conspiracy theories can be harmful. Please use our Conspiracy Generator with caution and do not target vulnerable groups of individuals.', icon="⚠️")
#     st.title("📰 The Official Version")
#     st.divider()

#     col_1, col_2 = st.columns(2)
    
#     with col_1:
#         st.info("What’s your conspiracy about? Every conspiracy theory starts from an official version of events.")
    
#     # Load data from Google Sheets
#     df = load_google_sheets_data()

#     # Get three random titles
#     random_titles = random.sample(list(df["Official_Version"]), 3)

#     # Create a dropdown to select one of the three stories
#     selected_title = st.selectbox("Select a story:", options=random_titles)

#     # Display the selected content
#     selected_row = df[df["Official_Version"] == selected_title].iloc[0]
#     selected_article_url = selected_row["News_Source"]
#     selected_article_content = selected_row["Summary"]

#     with col_2:
#         st.subheader("Article Summary")
#         st.write(selected_article_content)

#         st.write(f"[Read more]({selected_article_url})")

#     # Store the selected content in session state
#     st.session_state.selected_article_url = selected_article_url
#     st.session_state.selected_article_content = selected_article_content

# def display_page_2():
    
#     st.warning('DISCLAIMER: DISCLAIMER: False conspiracy theories can be harmful. Please use our Conspiracy Generator with caution and do not target vulnerable groups of individuals.', icon="⚠️")
#     st.title("📰 The Official Version")
#     st.info("What’s your conspiracy about? Every conspiracy theory starts from an official version of events.")
#     st.divider()
    
#     # Load data from Google Sheets
#     df = load_google_sheets_data()
    
#     # Display buttons for each story title
#     for index, row in df.iterrows():
#         if st.button(row["Official_Version"]):
#             selected_article_url = row["News_Source"]
#             selected_article_content = row["Summary"]

#             st.divider()

#             st.subheader("Article Summary")
#             st.write(selected_article_content)

#             st.write(f"[Read more]({selected_article_url})")

#             # Store the selected content in session state
#             st.session_state.selected_version = row["Official_Version"]
#             st.session_state.selected_article_url = selected_article_url
#             st.session_state.selected_article_content = selected_article_content

