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

def display_page_5():
    
    st.markdown("### Page 5")
    st.warning('DISCLAIMER: DISCLAIMER: False conspiracy theories can be harmful. Please use our Conspiracy Generator with caution and do not target vulnerable groups of individuals.', icon="⚠️")
    st.title("🔦 Conspiracy Generator")

    st.divider()
        
    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown("#### Hunting for anomalies…")
        st.info("🧑‍🎨 Time to get creative. We’re forging some surprising links with the culprits you have identified. This will make them look suspicious!" "\n- Find inconsistencies in the timeline.\n- Highlight contradictions in witness statements.")
        
        
    with col2: 
        st.markdown("#### Connecting the dots...")
        st.info("⛓️ No account of an event is ever complete. Now we’re looking for puzzling details or minor contradictions in the official story. They provide “proof” that the official version is a lie." "\n- Connect unconnected events to create intrigue. \n - Associate the culprits with unusual symbols.")
        

    col3, col4 = st.columns(2)
    
    with col3: 
        st.markdown("#### Dealing with counterevidence…")
        st.info("🤔 Hm, some evidence is hard to fit with the conspiracy theory. But perhaps conspirators fabricated the evidence to throw us off the scent? We’re making your conspiracy theory evidence-proof!" "\n- Label counterevidence as part of a larger cover-up. \n- Propose that evidence was planted to confuse. ")
        

    with col4: 
        st.markdown("#### Discrediting critics…")
        st.info("📢 What about those who support the official story? Let’s discredit them as gullible dupes of official propaganda – or as patsies of the conspirators! This should deal with pesky critics! " "\n- Label critics as government shills. \n - Suggest critics are manipulated by hidden powers.")
        