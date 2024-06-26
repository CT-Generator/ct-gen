import streamlit as st

from ct_gen.src.modules.scroll_up import scroll_up
from ct_gen.src.modules.image_functions import *


def display_page_4():
    scroll_up()
    image_path = "ct_gen/data/images/motives"
    step_title = "Step 3"
    title = "The Motive"
    info = "What's their endgame? Every conspiracy theory has a motive. Select one of the options below."
    sheet_name = "motives"
    instruction = "Select a motive"
    create_image_selection_view(image_path, step_title, title, info, sheet_name, instruction)
    