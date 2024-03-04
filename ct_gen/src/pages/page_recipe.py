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
def display_page_recipe():
    
    text_1 = """Our Conspiracy Generator follows a simple recipe. You can find the details in this academic paper or this blog post. You can also try out our recipe for yourself, without the aid of artificial intelligence. Here it is:"""
    text_2 = """
* **Hunt for anomalies**: Look for puzzling details, anomalies or contradictions in the official story, which “proves” that it must be false. You’re “just asking questions” at this point. Since no explanation of any event is ever complete, this will be easy.
* **Connect the dots**: Now you fabricate some “evidence” that implicates your culprit and reveal their evil schemes. Try to be creative and forge some suspicious connections between the story and your culprits. 
* **Dismiss counterevidence**: Spin a story suggesting that evidence is missing because the conspirators have been covering up their tracks. Likewise, apparent counterevidence could be planted by the conspirators to throw courageous truth-seekers such as yourself off the scent. Didn’t we tell you they are very devious?  
* **Discredit critics**: Pesky critics of your conspiracy theory can be dealt with in various ways: you can say that they are gullible dupes of official propaganda, that they have been manipulated, or that they are even complicit in the plot, being paid stooges of the conspirators.
"""

    st.markdown(text_1)
    st.markdown(text_2)
