import streamlit as st

import newspaper
from newspaper import Article

import pandas as pd
import random  # Import the random module
import toml

#from ct_gen.src.modules.google_sheets_api import load_google_sheets_data
from ct_gen.src.modules.image_functions import *


# Load the secrets from the secrets.toml file
secrets = toml.load(".streamlit/secrets.toml")

def display_page_2():
    
    image_path = "ct_gen/data/images/news"
    step_title = "Step 1"
    title = "The Official Version"
    info = "What’s your conspiracy about? Every conspiracy theory starts from an official version of events. Below, we have randomly selected some recent news stories. Select one or click refresh to sample new articles."
    sheet_name = "news"
    instruction = "Select a news story"
    
    create_image_selection_view(image_path, step_title, title, info, sheet_name, instruction)
    
    