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



# #Contents for page 2
# def display_page_2():
    
#     st.markdown("### Page 2")
#     st.warning('DISCLAIMER: False conspiracy theories can be harmful. Please use our Conspiracy Generator with caution and do not target vulnerable groups of individuals.', icon="⚠️")
#     st.title("📰 The Official Version")
#     st.info("What’s your conspiracy about? Every conspiracy theory starts from an official version of events.")
    
#     #st.subheader("Article Scraper")
    
#     col_1, col_2 = st.columns(2)
    
#     # Display buttons for selecting stories
#     df = load_google_sheets_data()
#     story_options = df["Official_Version"].tolist()
#     selected_story = st.selectbox("Select a story:", story_options)
    
#     # Display a text input for entering a URL
#     url = st.text_input("Or enter your URL:", placeholder="Paste URL and Enter")
    
#     if url:
#         try:
#             st.session_state.user_input_page_2 = url
            
#             # Scrape and display the article content based on the URL
#             article = Article(url)
#             article.download()
#             article.parse()
#             article.nlp()  # Use newspaper3k's natural language processing
            
#             # Display the article content from pasted URL
#             st.subheader("Article Content")
#             st.write(article.summary)  # Display the summarized text of the article
            
#             # Store the pasted URL in session state
#             st.session_state.selected_version = None
#             st.session_state.selected_article_url = url
#             st.session_state.selected_article_content = article.summary
            
#         except:
#             st.warning("Sorry, we couldn't scrape content from the provided URL. Please try another story.")
        
#     elif selected_story:
#         selected_article_url = df.loc[df["Official_Version"] == selected_story, "News_Source"].values[0]
#         selected_article_content = df.loc[df["Official_Version"] == selected_story, "Summary"].values[0]
        
#         # Store the selected content in session state
#         st.session_state.selected_version = selected_story
#         st.session_state.selected_article_url = selected_article_url
#         st.session_state.selected_article_content = selected_article_content
    
#     # Display the selected article summary if a story is selected
#     if hasattr(st.session_state, 'selected_article_content'):
#         st.subheader("Article Summary")
#         st.write(st.session_state.selected_article_content)
#         st.write(f"[Read more]({st.session_state.selected_article_url})")


# Buttons and Search bar
# @st.cache_data(ttl=3600)
# def get_random_stories():
#     df = load_google_sheets_data()
#     random_stories = df["Official_Version"].sample(3).tolist()
#     return random_stories

# def display_page_2():
#     st.markdown("### Page 2")
#     st.warning('DISCLAIMER: False conspiracy theories can be harmful. Please use our Conspiracy Generator with caution and do not target vulnerable groups of individuals.', icon="⚠️")
#     st.title("📰 The Official Version")
#     st.info("What’s your conspiracy about? Every conspiracy theory starts from an official version of events.")

#     # Custom CSS for full-width buttons
#     st.markdown("""
#     <style>
#         .stButton>button {
#             width: 100%;
#         }
#     </style>
#     """, unsafe_allow_html=True)
    
#     # Display the random stories as buttons
#     random_stories = get_random_stories()
#     for story in random_stories:
#         if st.button(story):
#             df = load_google_sheets_data()
#             selected_article_url = df.loc[df["Official_Version"] == story, "News_Source"].values[0]
#             selected_article_content = df.loc[df["Official_Version"] == story, "Summary"].values[0]
            
#             # Store the selected content in session state
#             st.session_state.selected_version = story
#             st.session_state.selected_article_url = selected_article_url
#             st.session_state.selected_article_content = selected_article_content

#     if st.button("Reload New Stories"):
#         st.cache_data.clear()  # Clear the cache
#         st.experimental_rerun()  # Rerun the app

#     # Display content from the selected story or URL
#     if hasattr(st.session_state, 'selected_article_content'):
#         st.subheader("Article Summary")
#         st.write(st.session_state.selected_article_content)
#         st.write(f"[Read more]({st.session_state.selected_article_url})")


#################
#################
    
# Cache the stories to prevent reloading every time
@st.cache_data(ttl=3600)  # Cache for an hour
def get_random_stories():
    df = load_google_sheets_data()
    random_stories = df["Official_Version"].sample(3).tolist()
    return random_stories

def display_page_2():
    
    st.markdown("### Step 1")
    #st.warning('DISCLAIMER: False conspiracy theories can be harmful. Please use our Conspiracy Generator with caution and do not target vulnerable groups of individuals.', icon="⚠️")
    st.title("📰 The Official Version")
    st.info("What’s your conspiracy about? Every conspiracy theory starts from an official version of events.")

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
    st.write("Click on a story to see the summary below:")
    story_selected = None
    for story in random_stories:
        if st.button(story):
            story_selected = story

    # Add the reload button
    if st.button("Load New Stories"):
        st.cache_data.clear()  # Clear the cache data
        st.experimental_rerun()  # Rerun the app

    # Input field for users to enter a custom URL
    url = st.text_input("Paste the web address of a newspaper article to see the summary below:", placeholder="Paste URL and Enter")

    df = load_google_sheets_data()  # Load data directly for selected stories

    # Handling the user-entered URL
    if url:
        try:
            # Scrape and process the article content based on the provided URL
            article = Article(url)
            article.download()
            article.parse()
            article.nlp()

            # Display the article content from the entered URL
            st.subheader("Article Content")
            st.write(article.summary)

            # Store the pasted URL and its content in session state
            st.session_state.selected_version = None
            st.session_state.selected_article_url = url
            st.session_state.selected_article_content = article.summary

        except:
            st.warning("Sorry, we could not load the story. Please try another or consider using a desktop.")

    # Handling the story selection from the buttons
    elif story_selected:
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
