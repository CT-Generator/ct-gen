import streamlit as st
import base64
import datetime
import gspread

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
from ct_gen.src.modules.google_sheets_api import load_google_sheets_data


# Code for page 3
def image_to_base64(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

@st.cache_data(ttl=3600, show_spinner=False)
def get_random_culprits():
    image_dir = "ct_gen/data/images/culprits"
    all_image_names = os.listdir(image_dir)
    culprits = random.sample(all_image_names, 3) if len(all_image_names) >= 3 else all_image_names
    return culprits

def display_image_link(column, culprit, image_path, image_width, image_height):
    base64_image = image_to_base64(image_path)
    image_html = f'''
    <div style="width: {image_width}px; height: {image_height}px;">
        <img src="data:image/png;base64,{base64_image}" alt="{culprit}" width="{image_width}" height="{image_height}" style="border: 1px solid #eee; padding: 5px;">
    </div>
    '''
    column.markdown(image_html, unsafe_allow_html=True)

    if column.button(culprit):
        df = load_google_sheets_data("culprits")
        if df is not None and "Culprits" in df.columns:
            selected_culprit_rows = df[df["Culprits"] == culprit]
            
            if not selected_culprit_rows.empty:
                selected_culprit_info = selected_culprit_rows["Culprit_Info"].values[0]

                # Store the clicked culprit's details in session state
                st.session_state.selected_culprit = culprit
                st.session_state.selected_culprit_info = selected_culprit_info

                st.subheader(f"Conspirator: {st.session_state.selected_culprit}")
                st.write(st.session_state.selected_culprit_info)
            else:
                st.error(f"No information found for {culprit}.")
        else:
            st.error("Error retrieving culprit info.")

def display_page_3():
    st.markdown("### Step 2")
    st.title("🐍 The Conspirators")
    
    st.info("Who’s behind it? Every conspiracy theory needs a sinister group of scheming culprits.")
    st.write("Click on a culprit to see the summary below:")
    
    st.markdown("""
    <style>
        .stButton>button {
            width: 100%;
        }
    </style>
    """, unsafe_allow_html=True)
    
    random_culprits = get_random_culprits()

    # Displaying the selected culprit and its info if it exists in session state
    if "selected_culprit" in st.session_state and "selected_culprit_info" in st.session_state:
        st.subheader(f"Conspirator: {st.session_state.selected_culprit}")
        st.write(st.session_state.selected_culprit_info)
    
    if not random_culprits:
        st.warning("No culprits to display.")
        return  # Exit the function early

    image_width = 225
    image_height = 225

    for i in range(0, len(random_culprits), 3):
        subset = random_culprits[i:i+3]
        cols = st.columns(3)
        for j, culprit_name in enumerate(subset):
            image_path = os.path.join("ct_gen/data/images/culprits", culprit_name)
            display_image_link(cols[j], culprit_name.split('.')[0], image_path, image_width, image_height)

    # Add the reload button
    if st.button("Load New Culprits"):
        if "culprits_list" in st.session_state:
            del st.session_state.culprits_list
        st.cache_data.clear()  # Clear the cache
        st.experimental_rerun()  # Rerun the app


    # USER INPUT SECTION
    user_input = st.text_input("Please paste your culprit here and hit Enter:")
    if user_input:
        st.session_state.user_input = user_input  # Store the user input in session state
        st.write(f"You entered: {user_input}")

        # Store the pasted culprit in session state
        st.session_state.selected_culprit = None
        st.session_state.selected_culprit = user_input


    


















        


