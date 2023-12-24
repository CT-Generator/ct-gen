import streamlit as st
import pandas as pd

#from ct_gen.src.modules.google_sheets_api import load_google_sheets_data
from ct_gen.src.modules.image_functions import *


def display_page_4():
    
    image_path = "ct_gen/data/images/motives"
    step_title = "Step 4"
    title = "The Motives"
    info = "What's their endgame? Every conspiracy theory has a motive. Select one of the options below."
    sheet_name = "motives"
    instruction = "Select a motive"
    
    create_image_selection_view(image_path, step_title, title, info, sheet_name, instruction)
    
    