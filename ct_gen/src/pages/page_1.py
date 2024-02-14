import streamlit as st

import datetime
import gspread

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
from ct_gen.src.modules.scroll_up import scroll_up

from ct_gen.src.pages.page_background import display_page_background
from ct_gen.src.modules.initialize_session_state import initalize_session_state_dict

# Code for page 1
def display_page_1():
    step_title = "Intro"
    title_1 = "Conspiracy Generator"
    info_1 = "Created by the Etienne Vermeersch Chair of Critical Thinking at Ghent University."
    
    title_2 = "Home Page"
    info_2 = "Make your own conspiracy theory in a few simple steps!"

    text_1 = """By following three simple steps, you can turn any story from your newspaper or from history books into an intriguing, shocking, mind-bending, earth-shattering, but still plausible-sounding Conspiracy Theory."""
    text_2 = """*Ideas*: [Maarten Boudry](https://research.flw.ugent.be/en/maarten.boudry) (Ghent University) & [Marco Meyer](https://www.philosophie.uni-hamburg.de/philosophisches-seminar/personen/meyer-marco.html) (University of Hamburg), *Design & Development*: [Natasha Newbold](https://www.linkedin.com/in/natasha-newbold/) ([TJI](https://techjobsinternational.com/)), *Image Generation*: [Peter Keroti](https://www.linkedin.com/in/peter-keroti) ([TJI](https://techjobsinternational.com/)) using Dall-e.
        """
    checkbox_label = "I agree that the generated conspiracy theory, the choices that led to its creation, and my rating of it will be recorded anonymously."
    
    st.markdown(f"<h3 style='text-align: center;'>{step_title}</h3>", unsafe_allow_html=True)
    st.markdown(f"<h1 style='text-align: center;'>{title_1}</h1>", unsafe_allow_html=True)
    st.info(info_1)
    st.markdown(f"<h1 style='text-align: center;'>{title_2}</h1>", unsafe_allow_html=True)
    st.markdown(text_1)

    with st.expander('Background and motivation about the Conspiracy Generator'):
        display_page_background()
    
    st.info(info_2)
    st.markdown(text_2)
    scroll_up()
