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


import base64

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

    
    @st.cache_data()
    def load_images(folder_path, file_name):
        
        image_path = os.path.join(folder_path, file_name)
        with open(image_path, "rb") as image:
            encoded = base64.b64encode(image.read()).decode()
            image = f"data:image/jpeg;base64,{encoded}"
        return image
        
    

    # HTML to use an image as a button
    folder_path = "ct_gen/data/images/functional/"
    image_path = "Load_more_button.jpg"  # Change to your image path or URL
    image = load_images(folder_path, image_path)
    #st.markdown(f'<a href="javascript:void(0)"><img src="{image}" alt="Image Button" style="width:100px;height:100px;"></a>', unsafe_allow_html=True)
    st.markdown(f'<a><img src="{image}" alt="Image Button" style="width:100px;height:100px;"></a>', unsafe_allow_html=True)


    
    
    test = st.components.v1.html("""
        <script>
        const imgButton = document.querySelector('a > img');
        imgButton.onclick = () => {
            return 1
        }
        </script>
    """, height=0)

    st.write(str(test))
    # Update session state when the image is clicked
    if st.experimental_get_query_params().get('button_clicked'):
        #st.session_state['button_clicked'] = True
        st.write("clicked")

    # Handling the click event in Streamlit
    if 'data' in st.session_state and st.session_state.data:
        st.write("Image clicked!")
        st.session_state.data = False  # Reset the state

    st.write(st.experimental_get_query_params())

    st.warning('DISCLAIMER: False conspiracy theories can be harmful. Please use our Conspiracy Generator with caution and do not target vulnerable groups or individuals.', icon="⚠️")
    
    test_button = st.button("test")
if __name__ == '__main__':
    main()
    