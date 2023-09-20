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


def display_page_1():
    
    #st.warning('DISCLAIMER: False conspiracy theories can be harmful. Please use our Conspiracy Generator with caution and do not target vulnerable groups or individuals.', icon="⚠️")
    st.title("Conspiracy Generator")
    st.divider()
    st.info("Welcome to the Conspiracy Generator! By following three simple steps, you can turn any story from your newspaper (or from history books) into an intriguing, shocking, mind-bending, titillating but still plausible-sounding Conspiracy Theory of your own choosing. Make your own Conspiracy Theory in a few simple steps! ")
    st.divider()

    #st.warning('DISCLAIMER: False conspiracy theories can be harmful. Please use our Conspiracy Generator with caution and do not target vulnerable groups or individuals.', icon="⚠️")
    st.markdown("""Want to learn more?""")  

    with st.expander("See Project Info"):
        st.subheader("📃 Project Info")
        st.info("Our Conspiracy Generator follows a simple recipe created to turn any event into one or more Conspiracy Theories, using a few simple steps and a few parameters. You can find all the details in this [academic paper](https://drive.google.com/file/d/1GMDVLdKfvaFnj8IFDyiRTGH3ePsOO9B7/view) or this [shorter blog post](https://maartenboudry.be/2020/09/how-not-to-get-sucked-into-an-intellectual-black-hole-on-the-warped-epistemology-of-conspiracy-theories.html). Our fully automatic Conspiracy Generator is powered by Open AI’s GPT-4, which churns out conspiracies at the drop of a hat. But you can also try out our recipe for yourself, without the aid of artificial intelligence! ")
        st.info("Learn more about the app on [GitHub](https://github.com/Tech-Jobs-International/ct-gen) Consider starring, thank you! ⭐ Report a [bug](https://github.com/Tech-Jobs-International/ct-gen/issues) 🐛")
        st.subheader("📃 Credits")
        st.info("Created by the Etienne Vermeersch Chair of Critical Thinking at Ghent University")
        st.info("Ideas: [Maarten Boudry](https://research.flw.ugent.be/en/maarten.boudry) & [Marco Meyer](https://www.philosophie.uni-hamburg.de/philosophisches-seminar/personen/meyer-marco.html)")
        st.info("Design & Development: [TJI](https://techjobsinternational.com/) ([Natasha Newbold](https://www.linkedin.com/in/natasha-newbold/) & [Justus Schollmeyer](https://www.linkedin.com/in/justus-schollmeyer-014a2314b/))")
    
    # Custom CSS for full-width buttons
    st.markdown("""
    <style>
        .stButton>button {
            width: 100%;
        }
    </style>
    """, unsafe_allow_html=True)

