import streamlit as st

import datetime
import gspread
#from initialize_session_state import initialize_session_state_dict
import newspaper
from oauth2client.service_account import ServiceAccountCredentials
import os
import openai
import pandas as pd
import random
import requests
from streamlit_extras.badges import badge
import sys
import time
import toml
import webbrowser

from ct_gen.src.modules.initialize_session_state import initalize_session_state_dict

# Load the secrets at the start of the app
def load_secrets():
    # Construct the full path to the secrets.toml file in the .streamlit directory
    secrets_file_path = os.path.join(".streamlit", "secrets.toml")

    # Load the secrets from the secrets.toml file
    secrets = toml.load(secrets_file_path)
    return secrets

# Load the secrets at the start of the app
secrets = load_secrets()

# Access your GPT API key
gpt_api_key = secrets["openai"]["api_key"]

# Set the GPT API key for OpenAI
openai.api_key = gpt_api_key

# Set the API URL explicitly if needed
openai.api_base = "https://api.openai.com/v1"

@st.cache_data
def generate_conspiracy_theory(selected_article_content, culprits, goals, motive_info):
    
    # Access the user inputs from the session state
    #selected_article_content = st.session_state.selected_article_content
    url = st.session_state.url
    #culprits = st.session_state.culprits
    #goals = st.session_state.goals
    #motive_info = st.session_state.motive_info

    # Set up your prompt for generating the conspiracy theory
    prompt = f"Generate a conspiracy theory involving {culprits} and their goal to {goals}. " \
             f"They are working against the official version which says: '{selected_article_content}'. " \
             f"Their motive behind this conspiracy is to {motive_info}. " \
             "The truth is hidden and only the chosen ones can see it. [GENERATE GT]"

    # Generate the conspiracy theory using OpenAI
    with st.spinner('Generating conspiracy theory...'):
        response = openai.ChatCompletion.create(
            model="gpt-4",  # Use the appropriate model name
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": prompt}
            ]
        )
    # Save the generated conspiracy theory in the session state
    #st.session_state.conspiracy_theory = response.choices[0].text.strip()
    st.session_state.conspiracy_theory = response.choices[0].message['content'].strip()



def display_page_6():
        
    st.warning('DISCLAIMER: DISCLAIMER: False conspiracy theories can be harmful. Please use our Conspiracy Generator with caution and do not target vulnerable groups of individuals.', icon="⚠️")
    st.title("🔦 Your conspiracy theory")
    st.divider()
    st.info("Here is you conspiracy theory.") 
    st.divider()
    # Call the function to generate the conspiracy theory
    st.subheader("Generated Conspiracy Theory")
    generate_conspiracy_theory(st.session_state.selected_article_content, st.session_state.culprits, st.session_state.goals, st.session_state.motive_info)
    # Display the generated conspiracy theory
    st.write(st.session_state.conspiracy_theory)