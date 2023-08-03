import streamlit as st

import datetime
import gspread
import newspaper
from oauth2client.service_account import ServiceAccountCredentials
import os
import openai
import pandas as pd
import random
import requests
from streamlit_extras.badges import badge
import sys
import webbrowser

from ct_gen.src.modules.page_nav import forward_button, backward_button

from ct_gen.src.pages.page_1 import display_page_1
from ct_gen.src.pages.page_2 import display_page_2
from ct_gen.src.pages.page_3 import display_page_3
from ct_gen.src.pages.page_4 import display_page_4
from ct_gen.src.pages.page_5 import display_page_5
from ct_gen.src.pages.page_6 import display_page_6
from ct_gen.src.modules.initialize_session_state import initalize_session_state_dict

import toml

initalize_session_state_dict()

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


def main():
    st.set_page_config(layout="centered",
                       page_title="Consipracy Generator",
                       page_icon = '🔦')
    
    if st.session_state["page_number"] == 1:
        display_page_1()
        st.markdown("---")
        col1, col2 = st.columns(2)
        forward_button(col2, "NEXT")
        
            
    if st.session_state["page_number"] == 2:
        display_page_2()
        st.markdown("---")
        col1, col2 = st.columns(2)
        backward_button(col1, "BACK")
        forward_button(col2, "NEXT")
        
    if st.session_state["page_number"] == 3:
        display_page_3()
        st.markdown("---")
        col1, col2 = st.columns(2)
        backward_button(col1, "BACK")
        forward_button(col2, "NEXT")
    
    if st.session_state["page_number"] == 4:
        display_page_4()
        st.markdown("---")
        col1, col2 = st.columns(2)
        backward_button(col1, "BACK")
        forward_button(col2, "NEXT")
    
    if st.session_state["page_number"] == 5:
        display_page_5()
        st.markdown("---")
        col1, col2 = st.columns(2)
        backward_button(col1, "BACK")
        forward_button(col2, "NEXT")
    
    if st.session_state["page_number"] == 6:
        display_page_6()
        st.markdown("---")
        col1, col2 = st.columns(2)
        backward_button(col1, "BACK")

    #Add badege - Repo needs to be public
    badge(type="github", name="Tech-Jobs-International/ct-generator")
    badge(type="twitter", name="streamlit")
    
if __name__ == '__main__':
    main()
    