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


def display_page_2():
    
    st.markdown("### Page 2")
    st.warning('DISCLAIMER: DISCLAIMER: False conspiracy theories can be harmful. Please use our Conspiracy Generator with caution and do not target vulnerable groups of individuals.', icon="⚠️")
    st.title("🔦 The Official Version")
    st.subheader("Article Scraper")
    st.markdown("What’s your conspiracy about? Every conspiracy theories starts from an official version of events")
    st.session_state["url"] = st.text_input("Enter url", placeholder="Paste URL and Enter", value=st.session_state["url"])