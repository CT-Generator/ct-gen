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

    # Rest of the content for page 5
    tab1, tab2, tab3, tab4 = st.tabs(["Refuting", "Hunting", "Dealing", "Discrediting"])

    with tab1:
        tab1.subheader("Refuting the official version…")
        st.markdown("🔦 No account of an event is ever complete.")
        st.markdown("Now we’re looking for puzzling details or minor contradictions in the official story. ")
        st.markdown("They provide “proof” that the official version is a lie.")

    with tab2: 
        tab2.subheader("Hunting for anomalies…")
        st.markdown("🔦 Time to get creative.")
        st.markdown("We’re forging some surprising links with the culprits you have identified")
        st.markdown("This will make them look suspicious!")
    
    with tab3: 
        tab3.subheader("Dealing with counterevidence…")
        st.markdown("🔦Hm, some evidence is hard to fit with the conspiracy theory.")
        st.markdown("But perhaps conspirators fabricated the evidence to throw us off the scent?")
        st.markdown("We’re making your conspiracy theory evidence-proof!")

    with tab4: 
        tab4.subheader("Discrediting critics…")
        st.markdown("🔦 What about those who support the official story?")
        st.markdown("Let’s discredit them as gullible dupes of official propaganda – or as patsies of the conspirators!")
        st.markdown("This should deal with pesky critics! ")