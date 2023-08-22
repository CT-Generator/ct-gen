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

from ct_gen.src.modules.initialize_session_state import initalize_session_state_dict
from ct_gen.src.modules.google_sheets_api import load_google_sheets_data


def display_page_4():
    
    st.warning('DISCLAIMER: False conspiracy theories can be harmful. Please use our Conspiracy Generator with caution and do not target vulnerable groups of individuals.', icon="⚠️")
    st.title("💡 The Motive")
    
    


    col_1, col_2 = st.columns(2)
    with col_1:
        st.info("Who’s behind it? Every conspiracy theory needs a sinister group of scheming culprits.")
    
    df = load_google_sheets_data()
    
    with col_2:
        selected_version = st.selectbox("Select a Motive:", df["Goals"])
    
    if selected_version:
        selected_motive_info = df.loc[df["Goals"] == selected_version, "Goals_Info"].values[0]
        
        st.divider()
        
        st.subheader("Goal Info")
        st.write(selected_motive_info)
        
        # Store the selected content in session state
        st.session_state.motives = selected_version
        st.session_state.motive_info = selected_motive_info
