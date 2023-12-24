import streamlit as st
import pandas as pd

#from ct_gen.src.modules.google_sheets_api import load_google_sheets_data
from ct_gen.src.modules.image_functions import *


def display_page_3():
    
    image_path = "ct_gen/data/images/culprits"
    step_title = "Step 2"
    title = "The Conspirators"
    info = "Who’s behind it? Every conspiracy theory needs a sinister group of scheming culprits. Pick one from the selection below."
    sheet_name = "culprits"
    instruction = "Select a culprit"
    
    create_image_selection_view(image_path, step_title, title, info, sheet_name, instruction)