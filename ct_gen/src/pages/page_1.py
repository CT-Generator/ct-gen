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

from ct_gen.src.modules.initialize_session_state import initalize_session_state_dict






# Code for page 1
def display_page_1():
    step_title = "Intro"
    title = "Conspiracy Generator"
    info_1 = "Created by the Etienne Vermeersch Chair of Critical Thinking at Ghent University."
    
    text_1 = f"""By following three simple steps, you can transform any narrative from your newspaper or history books into a conspiracy theory."""
    text_2 = """The methodology is detailed in this [academic article](https://drive.google.com/file/d/1GMDVLdKfvaFnj8IFDyiRTGH3ePsOO9B7/view?usp=share_link) and in this [blog post](https://maartenboudry.be/2020/09/how-not-to-get-sucked-into-an-intellectual-black-hole-on-the-warped-epistemology-of-conspiracy-theories.html).
        To illustrate the process in an engaging way, this app will guide you from a mundane news story to crafting your very own distinctive conspiracy theory.
        """
    text_3 = """*Ideas*: [Maarten Boudry](https://research.flw.ugent.be/en/maarten.boudry) (Ghent University) & [Marco Meyer](https://www.philosophie.uni-hamburg.de/philosophisches-seminar/personen/meyer-marco.html) (University of Hamburg), *Design & Development*: [Natasha Newbold](https://www.linkedin.com/in/natasha-newbold/) ([TJI](https://techjobsinternational.com/)), *Image Generation*: [Peter Keroti](https://www.linkedin.com/in/peter-keroti) ([TJI](https://techjobsinternational.com/)) using Dall-e.
        """
    checkbox_label = "I agree that the generated conspiracy theory, the choices that led to its creation, and my rating of it will be recorded anonymously."
    
    st.markdown(f"<h3 style='text-align: center;'>{step_title}</h3>", unsafe_allow_html=True)
    st.markdown(f"<h1 style='text-align: center;'>{title}</h1>", unsafe_allow_html=True)
    st.info(info_1)
    st.markdown(text_1)
    st.markdown(text_2)
    st.markdown(text_3)