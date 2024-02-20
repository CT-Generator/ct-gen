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
    title = "Conspiracy Generator"
    sub_title = "Make your own conspiracy theory in a few simple steps! "

    text = """By following three simple steps, you can turn any story from your newspaper or from history books into an intriguing, shocking, mind-bending, earth-shattering, but still plausible-sounding Conspiracy Theory."""
    info = """*Ideas*: [Maarten Boudry](https://research.flw.ugent.be/en/maarten.boudry) (Ghent University) & [Marco Meyer](https://www.philosophie.uni-hamburg.de/philosophisches-seminar/personen/meyer-marco.html) (University of Hamburg)
    \n*Design & Development*: [Natasha Newbold](https://www.linkedin.com/in/natasha-newbold/) ([TJI](https://techjobsinternational.com/)), [Mohammed Darras](https://www.linkedin.com/in/mohammed-darras/) ([TJI](https://techjobsinternational.com/)) 
    \n*Image Generation*: [Peter Keroti](https://www.linkedin.com/in/peter-keroti) ([TJI](https://techjobsinternational.com/)) using Dall-e 
    \n*Funding*: Etienne Vermeersch Chair of Critical Thinking at Ghent University
        """
    checkbox_label = "I agree that the generated conspiracy theory, the choices that led to its creation, and my rating of it will be recorded anonymously."
    
    st.markdown(f"<h3 style='text-align: center;'>{step_title}</h3>", unsafe_allow_html=True)
    st.markdown(f"<h1 style='text-align: center;'>{title}</h1>", unsafe_allow_html=True)
    st.markdown(f"<h3 style='text-align: center; color:blue;'><i>{sub_title}<i></h3>", unsafe_allow_html=True)
    st.markdown(text)
    st.info(info)
   
    with st.expander('Background and motivation about the Conspiracy Generator'):
        display_page_background()

    scroll_up()
