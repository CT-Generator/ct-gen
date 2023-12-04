import streamlit as st
import datetime
import gspread
#from gsheetsdb import connect
import shillelagh
import sqlite3
import base64
import newspaper
from oauth2client.service_account import ServiceAccountCredentials
from oauth2client import service_account
import os
import openai
import pandas as pd
import random
import requests
#from streamlit_extras.badges import badge
import time
import sys
import webbrowser
from openai import OpenAI
import toml
#from googleapiclient.discovery import build

from ct_gen.src.modules.initialize_session_state import initalize_session_state_dict 

# Access the Google Sheets API credentials from st.secrets
google_sheets_credentials = st.secrets["gcp_service_account"]

# Set up Google Sheets API credentials
scope = ['https://spreadsheets.google.com/feeds', 'https://www.googleapis.com/auth/drive']
creds = ServiceAccountCredentials.from_json_keyfile_dict(google_sheets_credentials, scope)
client = gspread.authorize(creds)


def create_prompt():
    selected_article_content = st.session_state["selected_article_content"]
    culprits = st.session_state["selected_culprit"]
    culprits_info = st.session_state["selected_culprit_info"]
    motive = st.session_state["selected_motive"]
    motive_info = st.session_state["selected_motive_info"]
    
    prompt = f"Turn the following news story into a conspiracy theory by finding loopholes in the story: {selected_article_content}\
        The conspirator(s) of your story: {culprits} ({culprits_info}).\
        The motive behind the conspiracy is: {motive} ({motive_info}).\
        Make sure to make yourself immune against criticism. Label potential counter evidence of this conspiracy as part of the plot.\
        Start the story with a catchy title. Format everything in markdown."
    return prompt
    
# Load the secrets at the start of the app
def load_secrets():
    # Construct the full path to the secrets.toml file in the .streamlit directory
    secrets_file_path = os.path.join(".streamlit", "secrets.toml")

    # Load the secrets from the secrets.toml file
    secrets = toml.load(secrets_file_path)
    return secrets



# Generate CT function
def generate_conspiracy_theory(prompt, client):
        
    # Set up your prompt for generating the conspiracy theory
    
    res_box = st.empty()
    report = []
    # Looping over the response
    #for resp in openai.Completion.create(model='gpt-4', prompt=prompt, temperature = 0.9, stream = True):
    #    report.append(resp.choices[0].text)
    #    result = "".join(report).strip()
    #    result = result.replace("\n", "")        
    #    res_box.markdown(f'*{result}*') 

    
    stream = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "You are an educational tool. You show people how easy it is to turn anything into a conspiracy. By doing so, you are able to teach people that they should not believe in conspiracies without careful examination."},
            {"role": "user", "content": prompt},
            ],
        stream=True,
    )
    for chunk in stream:
        if chunk.choices[0].delta.content is not None:
            report.append(chunk.choices[0].delta.content)
            result = "".join(report).strip()
            #result = result.replace("\n", " ")        
            res_box.markdown(f'{result}') 
    
    
    
    
    
# Display page
def display_page_6():
    
    # Load the secrets at the start of the app
    secrets = load_secrets()
    client = OpenAI(api_key=secrets["openai"]["api_key"])
    
    prompt = create_prompt()
    
   
    #st.divider()
    generation_button = st.button("Generate your theory!")
    if generation_button:
        generate_conspiracy_theory(prompt, client)
    
