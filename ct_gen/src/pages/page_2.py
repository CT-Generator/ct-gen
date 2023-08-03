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
import webbrowser
import toml

from ct_gen.src.modules.initialize_session_state import initalize_session_state_dict

# Load the secrets from the secrets.toml file
secrets = toml.load(".streamlit/secrets.toml")

# Function to load Google Sheets data
def load_google_sheets_data():
    # Define the scope and credentials for Google Sheets API
    scope = ['https://spreadsheets.google.com/feeds', 'https://www.googleapis.com/auth/drive']
    credentials = ServiceAccountCredentials.from_json_keyfile_dict(secrets['google_sheets'], scope)
    
    # Authenticate and access the Google Sheets API
    gc = gspread.authorize(credentials)
    
    # Load the Google Sheets data
    spreadsheet_url = secrets['google_sheets']['spreadsheet']
    worksheet_name = secrets['google_sheets']['worksheet']
    sheet = gc.open_by_url(spreadsheet_url).sheet1  # Replace 'sheet1' with the correct worksheet name if needed
    data = sheet.get_all_values()
    
    # Convert the data to a DataFrame
    df = pd.DataFrame(data[1:], columns=data[0])
    return df

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
        st.write(selected_article_url)
