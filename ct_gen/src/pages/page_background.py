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

from ct_gen.src.modules.initialize_session_state import initalize_session_state_dict






# Code for page motives
def display_page_background():
    
    step_title = "Background & Motivation"
    title_1 = "What’s the point of the Conspiracy Generator?"
    info_1 = "(For a longer background and motivation, see this [blog post](https://maartenboudry.be/2020/09/how-not-to-get-sucked-into-an-intellectual-black-hole-on-the-warped-epistemology-of-conspiracy-theories.html) and this [academic paper](https://drive.google.com/file/d/1GMDVLdKfvaFnj8IFDyiRTGH3ePsOO9B7/view?usp=share_link))"
    
    text_1a = f"""Conspiracy theories are all around us. From the 9/11 attacks to the coronavirus pandemic, from the assassination of John F. Kennedy to the birth certificate of Barack Obama, from the Moon landing to just about any mass shooting or terrorist attack – all these events have sparked suspicions and allegations that the official version we’ve been told is a lie. That far more sinister things are going on behind the scenes."""
    text_2a = """Some conspiracies are real, of course, as any historian will tell you (e.g., the Watergate scandal, the October revolution). But people believe in many more unfounded conspiracy theories than there are actual conspiracies to go around. That’s because stories about  hidden plots are extremely alluring. In fact, it’s quite easy to generate a conspiracy theory around any news story, and to maintain that theory in the face of any evidence or counterarguments. All you need to do is follow a few simple steps!
        """
    text_3a = """We have designed a **Conspiracy Generator** that can turn any story from your local newspaper (or from history books) into a conspiracy theory, with your own designated culprit and their motive. In fact, our Conspiracy Generator can generate multiple and mutually contradictory theories around every story, just as there are conflicting conspiracy theories about the assassination of JFK or the 9/11 attacks."""
 
    title_2 = "What’s the recipe for a great conspiracy theory?"
    
    text_1b = """Our Conspiracy Generator follows a simple recipe. You can find the details in this academic paper or this blog post. You can also try out our recipe for yourself, without the aid of artificial intelligence. Here it is:"""
    text_2b = """
* **Hunt for anomalies**: Look for puzzling details, anomalies or contradictions in the official story, which “proves” that it must be false. You’re “just asking questions” at this point. Since no explanation of any event is ever complete, this will be easy.
* **Connect the dots**: Now you fabricate some “evidence” that implicates your culprit and reveal their evil schemes. Try to be creative and forge some suspicious connections between the story and your culprits. 
* **Dismiss counterevidence**: Spin a story suggesting that evidence is missing because the conspirators have been covering up their tracks. Likewise, apparent counterevidence could be planted by the conspirators to throw courageous truth-seekers such as yourself off the scent. Didn’t we tell you they are very devious?  
* **Discredit critics**: Pesky critics of your conspiracy theory can be dealt with in various ways: you can say that they are gullible dupes of official propaganda, that they have been manipulated, or that they are even complicit in the plot, being paid stooges of the conspirators.
"""

    st.markdown(f"<h3 style='text-align: center;'>{step_title}</h3>", unsafe_allow_html=True)
    st.markdown(f"<h1 style='text-align: center;'>{title_1}</h1>", unsafe_allow_html=True)
    st.info(info_1)
    st.markdown(text_1a)
    st.markdown(text_2a)
    st.markdown(text_3a)
    st.markdown(f"<h1 style='text-align: center;'>{title_2}</h1>", unsafe_allow_html=True)
    st.markdown(text_1b)
    st.markdown(text_2b)
    scroll_up()