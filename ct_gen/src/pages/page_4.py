import streamlit as st
import pandas as pd

from ct_gen.src.modules.google_sheets_api import load_google_sheets_data
from ct_gen.src.modules.image_functions import *


def display_page_4():
    motives_df = load_google_sheets_data("goals")
    random_motives = select_random_file_names("ct_gen/data/images/motives", n_random_files=3, change_tracker = st.session_state["change_tracker"])
    images = load_images(folder_path="ct_gen/data/images/motives", file_names=random_motives)
    

    st.markdown("<h3 style='text-align: center;'>Step 3</h3>", unsafe_allow_html=True)
    st.markdown("<h1 style='text-align: center;'>🐍 The Motives</h1>", unsafe_allow_html=True)
    st.info("What's their endgame? Every conspiracy theory has a motive. Select one of the options below.")
    
    selected_motive = display_image_options(images, random_motives, key="motive")
    
    if selected_motive:

        st.session_state["selected_motive"] = selected_motive
        st.session_state["selected_motive_info"] = motives_df[motives_df["Goals"] == selected_motive]["Goals_Info"].iloc[0]
        
        if "selected_motive" in st.session_state and "selected_motive_info" in st.session_state:
            
            col1, col2, col3 = st.columns([0.25, 0.55, 0.2])
            col1.markdown(f"### {st.session_state.selected_culprit}")
            col2.info(st.session_state.selected_culprit_info)
            col3.text("")
            load_more_button_1 = col3.button("load more", "load_more_button_1")
            if load_more_button_1:
                st.session_state["change_tracker"] = st.session_state["change_tracker"] + 1
                st.experimental_rerun()
    
    else:
        
        st.markdown(" ")
        st.warning("Select a motive")
        st.markdown(" ")
        st.markdown(" ")
        load_more_button_2 = st.button("load more", "load_more_button_2")
        if load_more_button_2:
            st.session_state["change_tracker"] = st.session_state["change_tracker"] + 1
            st.experimental_rerun()
        


    
    # USER INPUT SECTION
    #user_input = st.text_input("Please paste your motive here and hit Enter:")
    #if user_input:
    #    st.session_state.user_input = user_input  # Store the user input in session state
    #    st.write(f"You entered: {user_input}")

        # Store the pasted motive in session state
    #    st.session_state.selected_motive_info = None
    #    st.session_state.selected_motive_info = user_input