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
from ct_gen.src.modules.image_functions import display_list_of_images
#from googleapiclient.discovery import build

from ct_gen.src.modules.initialize_session_state import initalize_session_state_dict 

# Access the Google Sheets API credentials from st.secrets
google_sheets_credentials = st.secrets["gcp_service_account"]

# Set up Google Sheets API credentials
scope = ['https://spreadsheets.google.com/feeds', 'https://www.googleapis.com/auth/drive']
creds = ServiceAccountCredentials.from_json_keyfile_dict(google_sheets_credentials, scope)
client = gspread.authorize(creds)


def create_prompt():
    selected_article_content = st.session_state["news_summary"]
    culprits = st.session_state["culprits_name"]
    culprits_info = st.session_state["culprits_summary"]
    motive = st.session_state["motives_name"]
    motive_info = st.session_state["motives_summary"]
        
    prompt = f"""Write a convicing cospiracey theory by turning the following news story into a conspiracy theory: {selected_article_content}
        The conspirator(s) of your story are: {culprits} ({culprits_info}).
        The motive of these conspirators: {motive} ({motive_info}).
        You construct the conspiracy by following these steps:
        You find some suspicious loopholes, puzzling details and anomalies in the official story. You 'just ask questions' in the style of conspiracy theorists.
        You fabricate some 'evidence' that {selected_article_content} is a cover-up of {culprits} trying to achieve {motive}. You 'connect the dots' in the style of conspiracy theorists, using available information about {culprits}.
        You anticipate counterarguments against the conspiracy theory by arguing that missing evidence and counterevidence is in fact part of the plot. Make sure to make the conspiracy theory immune against criticism
        You discredit people who are sceptical of the conspiracy theory by suggesting they are gullible dupes or patsies complicit in the conspiracy
        Write a convicing story starting with a catchy title. Everything must be formated in markdown."""

    return prompt


    
# Load the secrets at the start of the app
def load_secrets():
    # Construct the full path to the secrets.toml file in the .streamlit directory
    secrets_file_path = os.path.join(".streamlit", "secrets.toml")

    # Load the secrets from the secrets.toml file
    secrets = toml.load(secrets_file_path)
    return secrets



# Generate CT function
@st.cache_data()
def generate_conspiracy_theory(prompt, _client):
        
    # Set up your prompt for generating the conspiracy theory
    
    res_box = st.empty()
    report = []
    # Looping over the response
    #for resp in openai.Completion.create(model='gpt-4', prompt=prompt, temperature = 0.9, stream = True):
    #    report.append(resp.choices[0].text)
    #    result = "".join(report).strip()
    #    result = result.replace("\n", "")        
    #    res_box.markdown(f'*{result}*') 

    
    stream = _client.chat.completions.create(
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
    
    step_title = "Step 4"
    title = "Your Conspiracy Theory"
    info = "See how your selection of culprits and motives turns a simple news story into a conspiracy theory."
    
    
    st.markdown(f"<h3 style='text-align: center;'>{step_title}</h3>", unsafe_allow_html=True)
    st.markdown(f"<h1 style='text-align: center;'>{title}</h1>", unsafe_allow_html=True)
    st.info(info)
    
    # Load the secrets at the start of the app
    secrets = load_secrets()
    client = OpenAI(api_key=secrets["openai"]["api_key"])
    images = [st.session_state["news_img"], st.session_state["culprits_img"], st.session_state["motives_img"]]
    names = [st.session_state["news_name"], st.session_state["culprits_name"], st.session_state["motives_name"]]
    
    display_list_of_images(images, names)
    
    prompt = create_prompt()
    
   
    st.divider()
    #generation_button = st.button("Generate your theory!")
    #if generation_button:
    #generate_conspiracy_theory(prompt, client)
    


