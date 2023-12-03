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

from ct_gen.src.modules.page_nav import forward_button, backward_button, begin_button

from ct_gen.src.pages.page_1 import display_page_1
from ct_gen.src.pages.page_2 import display_page_2
from ct_gen.src.pages.page_3 import display_page_3
from ct_gen.src.pages.page_4 import display_page_4
from ct_gen.src.pages.page_5 import display_page_5
from ct_gen.src.pages.page_6 import display_page_6
from ct_gen.src.modules.initialize_session_state import initalize_session_state_dict

import toml

from st_clickable_images import clickable_images
from st_click_detector import click_detector

import base64
from PIL import Image

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

# Assign OpenAI key
openai.api_key = secrets["openai"]["api_key"]
openai.api_base = "https://api.openai.com/v1"



def main():
    st.set_page_config(layout="centered",
                       page_title="Consipracy Generator",
                       page_icon = '🔦')
    
    
    

    if "n_clicks" not in st.session_state:
        st.session_state["n_clicks"] = "0"

    with st.sidebar:
        choice = st.radio("Radio", [1, 2, 3])

    id = str(int(st.session_state["n_clicks"]) + 1)

    content = f"<a href='#' id='{id}'><img src='https://icons.iconarchive.com/icons/custom-icon-design/pretty-office-7/256/Save-icon.png'></a>"

    clicked = click_detector(content, key="click_detector")

    if clicked != "" and clicked != st.session_state["n_clicks"]:
        st.session_state["n_clicks"] = clicked
        st.subheader("Saving Report..")
    else:
        st.subheader(f"Choice: #{choice}")
    
    testbutton = st.button("click me")
    
    
if __name__ == '__main__':
    main()
    