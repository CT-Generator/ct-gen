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
from ct_gen.src.modules.rating_buttons import add_rating_buttons
from ct_gen.src.modules.google_sheets_api import insert_row_to_sheet, connect_to_google_sheets_data
from ct_gen.src.modules.initialize_session_state import initalize_session_state_dict
from ct_gen.src.modules.pdf_download import add_pdf_button


def create_explanation_prompt():
    selected_article_content = st.session_state["news_summary"]
    culprits = st.session_state["culprits_name"]
    culprits_info = st.session_state["culprits_summary"]
    motive = st.session_state["motives_name"]
    motive_info = st.session_state["motives_summary"]
    
    ct = st.session_state["conspiracy_theory"]
    prompt = st.session_state["prompt"]
        
    prompt = f"""You have created the following conspiracy theory
        {ct} by following the recipe {prompt}.
        Reflect on how you constructed this theory and explain it in simple terms."""

    return prompt


    
# Load the secrets at the start of the app
def load_secrets():
    secrets_file_path = os.path.join(".streamlit", "secrets.toml")
    secrets = toml.load(secrets_file_path)
    return secrets

# Generate CT function
@st.cache_data()
def generate_explanation(prompt, _client):
        
    res_box = st.empty()
    report = []

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
            res_box.markdown(f'{result}') 
            
    st.session_state["conspiracy_explanation"] = "".join(report).strip()
    
# Display page
def display_page_6():
    sheet = connect_to_google_sheets_data()
    #initalize_session_state_dict()
    step_title = "Step 5"
    title = "Explanation"
    info = "See how your conspiracy theory got constructed."
    
    
    st.markdown(f"<h3 style='text-align: center;'>{step_title}</h3>", unsafe_allow_html=True)
    st.markdown(f"<h1 style='text-align: center;'>{title}</h1>", unsafe_allow_html=True)
    st.info(info)
    
    # Load the secrets at the start of the app
    secrets = load_secrets()
    client = OpenAI(api_key=secrets["openai"]["api_key"])
    images = [st.session_state["news_img"], st.session_state["culprits_img"], st.session_state["motives_img"]]
    captions = [st.session_state["news_caption"], st.session_state["culprits_caption"], st.session_state["motives_caption"]]
    
    display_list_of_images(images, captions)
    
    st.session_state["explanation_prompt"] = create_explanation_prompt()
   
    st.divider()
    #generation_button = st.button("Generate your theory!")
    #if generation_button:
    
    generate_explanation(st.session_state["prompt"], client)
    
    row = [
        st.session_state["prompt"],
        st.session_state["conspiracy_theory"],
        st.session_state["conspiracy_explanation"],
    ]
    if st.session_state["conspiracy_explanation"] == "":
        insert_row_to_sheet(sheet, "generated_ct", row)
    
    #add_rating_buttons(sheet)
    
    # if st.session_state["conspiracy_theory"] != "":
    #     add_pdf_button(st.session_state["conspiracy_theory"])