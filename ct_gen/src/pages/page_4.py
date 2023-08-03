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


def display_page_4():
    
    st.markdown("### Page 4")
    st.warning('DISCLAIMER: DISCLAIMER: False conspiracy theories can be harmful. Please use our Conspiracy Generator with caution and do not target vulnerable groups of individuals.', icon="⚠️")
    st.title("🔦 The Motive")
    st.subheader("Select a Motive")
    st.markdown("What do the plotters want? Every conspiracy theory needs to assigns a motive. ")
    st.session_state["motive_info"] = st.text_input("Motive Information", placeholder="The Society seeks to uncover hidden truths and secrets from the past...", key="new_motive_info", value=st.session_state["motive_info"])