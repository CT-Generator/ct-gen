import streamlit as st
import pandas as pd

from ct_gen.src.modules.google_sheets_api import load_google_sheets_data
from ct_gen.src.modules.image_functions import *


def display_page_3():
    
    
    culprits_df = load_google_sheets_data("culprits")
    random_culprits = select_random_file_names("ct_gen/data/images/culprits", n_random_files=3, change_tracker = st.session_state["change_tracker"])
    images = load_images(folder_path="ct_gen/data/images/culprits", file_names=random_culprits)
    

    st.markdown("<h3 style='text-align: center;'>Step 2</h3>", unsafe_allow_html=True)
    st.markdown("<h1 style='text-align: center;'>🐍 The Conspirators</h1>", unsafe_allow_html=True)
    st.info("Who’s behind it? Every conspiracy theory needs a sinister group of scheming culprits. Pick one from the selection below.")
    
    
    selected_culprit = display_image_options(images, random_culprits, key="culprit")
    
    
    if selected_culprit:

        st.session_state["selected_culprit"] = selected_culprit
        st.session_state["selected_culprit_info"] = culprits_df[culprits_df["Culprits"] == selected_culprit]["Culprit_Info"].iloc[0]
        
        if (st.session_state["selected_culprit"] != "") and (st.session_state["selected_culprit_info"] != ""):
            
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
        st.warning("Select a culprit")
        st.markdown(" ")
        st.markdown(" ")
        load_more_button_2 = st.button("load more", "load_more_button_2")
        if load_more_button_2:
            st.session_state["change_tracker"] = st.session_state["change_tracker"] + 1
            st.experimental_rerun()
        

    
    # USER INPUT SECTION
    
    #user_input = st.text_input("Please paste your culprit here and hit Enter:")
    #if user_input:
    #    is_appropriate, message = moderate_text(user_input)
    #    if is_appropriate:
    #        st.session_state.user_input = user_input
    #        st.write(f"You entered: {user_input}")

            # Store the pasted culprit in session state
    #        st.session_state.selected_culprit = None
    #        st.session_state.selected_culprit = user_input
    #    else:
    #        st.error(message)


    


















        


