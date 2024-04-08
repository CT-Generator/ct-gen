import streamlit as st

import pandas as pd
from ct_gen.src.modules.scroll_up import scroll_up
from ct_gen.src.modules.image_functions import *


# Load the secrets from the secrets.toml file
#secrets = toml.load(".streamlit/secrets.toml")

def display_page_2():
    scroll_up()
    image_path = "ct_gen/data/images/news"
    step_title = "Step 1"
    title = "The Official Version"
    info = "What’s your conspiracy about? Every conspiracy theory starts from an official version of events. Below, we have randomly selected some recent news stories. Select one or click refresh to sample new articles."
    sheet_name = "news"
    instruction = "Select a news story"
    create_image_selection_view(image_path, step_title, title, info, sheet_name, instruction)