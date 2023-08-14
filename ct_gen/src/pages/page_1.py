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
    
    st.warning('DISCLAIMER: DISCLAIMER: False conspiracy theories can be harmful. Please use our Conspiracy Generator with caution and do not target vulnerable groups of individuals.', icon="⚠️")
    st.title("🔦 Conspiracy Generator")
    st.divider()
    st.info("Welcome to the Conspiracy Generator! By following three simple steps, you can turn any story from your newspaper (or from history books) into an intriguing, shocking, mind-bending, titillating but still plausible-sounding Conspiracy Theory of your own choosing. Make your own Conspiracy Theory in a few simple steps! ")
    st.divider()
    st.markdown("""Want to see how?""")  

    with st.expander("See Project Info"):
        st.subheader("📃 Credits")
        st.info("Created by the Etienne Vermeersch Chair of Critical Thinking at Ghent University")
        st.info("Ideas: [Maarten Boudry](https://research.flw.ugent.be/en/maarten.boudry) & [Marco Meyer](https://www.philosophie.uni-hamburg.de/philosophisches-seminar/personen/meyer-marco.html)")
        st.info("Design & Development: [TJI](https://techjobsinternational.com/) ([Natasha Newbold](https://www.linkedin.com/in/natasha-newbold/) & [Justus Schollmeyer](https://www.linkedin.com/in/justus-schollmeyer-014a2314b/))")
        st.info("Learn more about the app on [GitHub](https://github.com/Tech-Jobs-International/ct-gen)")


