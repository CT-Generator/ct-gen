import streamlit as st

import datetime
import gspread
#from initialize_session_state import initialize_session_state_dict
import newspaper
from oauth2client.service_account import ServiceAccountCredentials
import os
import openai
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

def display_page_3():
    
    st.markdown("### Page 3")
    st.warning('DISCLAIMER: DISCLAIMER: False conspiracy theories can be harmful. Please use our Conspiracy Generator with caution and do not target vulnerable groups of individuals.', icon="⚠️")
    st.title("🐍 The Conspirators")
    #st.divider()
    #st.info("Who’s behind it? Every conspiracy theory needs a sinister group of scheming culprits.")
    #st.divider()
    #st.session_state["culprits"] = st.text_input("Conspirator Name", placeholder="The Jazz Cabal", key="new_conspirator_name", value=st.session_state["culprits"])
    #st.session_state["goals"] = st.text_input("Conspirator Information", placeholder="A secret society of jazz musicians who use their mesmerizing improvised music for mind control.", key="new_conspirator_info", value=st.session_state["goals"])
    
    col_1, col_2 = st.columns(2)
    with col_1:
        st.info("Who’s behind it? Every conspiracy theory needs a sinister group of scheming culprits.")
    
    df = load_google_sheets_data()
    
    with col_2:
        selected_version = st.selectbox("Select a Conspirator:", df["Culprits"])
    
    if selected_version:
        selected_culprit_info = df.loc[df["Culprits"] == selected_version, "Culprit_Info"].values[0]
        
        st.divider()
        
        st.subheader("Culprit Info")
        st.write(selected_culprit_info)
        
        # Store the selected content in session state
        st.session_state.selected_culprit = selected_version
        st.session_state.selected_culprit_info = selected_culprit_info