import streamlit as st

import datetime
import gspread
from google.oauth2 import service_account
#from gsheetsdb import connect (deprecated)
from shillelagh.backends.apsw.db import connect
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


# this class ensures we have an working API key
class OpenAI_API: 
    def __init__(self, api_key):
        self.api_key = api_key

    def __enter__(self):
        openai.api_key = self.api_key

    def __exit__(self, exc_type, exc_val, exc_tb):
        pass

# Check for API key  
def run_app():
  api_key = st.secrets["api_key"]['open_ai']
  if api_key is None:
    st.error('API key not found. Please set the api_key in the .streamlit/secrets.toml file.')     

# # Pull private google sheet into Streamlit app using shillelagh
private_gsheets_url = st.secrets["google_sheets"]["private_gsheets_url"]

def create_connection():
    if 'email' in st.session_state:
        credentials = service_account.Credentials.from_service_account_info(
            st.secrets["gcp_service_account"], 
            scopes=["https://www.googleapis.com/auth/spreadsheets"]
        )
        connection = connect(":memory:", adapter_kwargs={
            "gsheetsapi": { 
                "service_account_info": {
                    "type": st.secrets["gcp_service_account"]["type"],
                    "project_id": st.secrets["gcp_service_account"]["project_id"],
                    "private_key_id": st.secrets["gcp_service_account"]["private_key_id"],
                    "private_key": st.secrets["gcp_service_account"]["private_key"],
                    "client_email": st.secrets["gcp_service_account"]["client_email"],
                    "client_id": st.secrets["gcp_service_account"]["client_id"],
                    "auth_uri": st.secrets["gcp_service_account"]["auth_uri"],
                    "token_uri": st.secrets["gcp_service_account"]["token_uri"],
                    "auth_provider_x509_cert_url": st.secrets["gcp_service_account"]["auth_provider_x509_cert_url"],
                    "client_x509_cert_url": st.secrets["gcp_service_account"]["client_x509_cert_url"],
                },
                "spreadsheet_url": private_gsheets_url,
            }
        })
    return connection.cursor()



#rest of code...
# def test_openai_connection():
#     try:
#         # Make a test call to the OpenAI API
#         openai.Completion.create(prompt="This is a test.", max_tokens=5)
#         return True
#     except Exception as e:
#         return False



def main():
    st.set_page_config(layout="centered",
                       page_title="Consipracy Generator",
                       page_icon = '🔦')

    # # Check if connected to OpenAI API
    # if test_openai_connection():
    #     st.success("Connected to OpenAI API")
    # else:
    #     st.error("Failed to connect to OpenAI API")

    # Rest of your code...
    if st.session_state["page_number"] == 1:
        display_page_1()
        st.markdown("---")
        col1, col2 = st.columns(2)
        forward_button(col2, "Start")
        
            
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
    