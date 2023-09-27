import streamlit as st

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

@st.cache_data(ttl=3600, show_spinner=False)
def get_random_culprits():
    if "culprits_list" not in st.session_state:
        df = load_google_sheets_data("culprits")

        if df is None or df.empty:
            st.error("Failed to load culprits data from Google Sheets.")
            return pd.DataFrame()  # Return an empty DataFrame

        st.session_state.culprits_list = df.sample(3)  # sample 3 culprits

    return st.session_state.culprits_list

def get_random_culprits_new(df):
    #st.session_state.culprits_list = df.sample(3)  # sample 3 culprits
    return df.sample(3)  # sample 3 culprits


def display_image_link(column, culprit, Culprit_Image_URL, image_width, image_height):
    link_id = culprit.replace(" ", "_")

    # Display the image without the button overlay
    image_html = f'''
    <div style="width: {image_width}px; height: {image_height}px;">
        <img src="{Culprit_Image_URL}" alt="{culprit}" width="{image_width}" height="{image_height}" style="border: 1px solid #eee; padding: 5px;">
    </div>
    '''

    column.markdown(image_html, unsafe_allow_html=True)

    # Use Streamlit button for interactions
    if column.button(f"{culprit}"):
        # Capture the clicked culprit's details
        df = load_google_sheets_data("culprits")
        if df is not None and "Culprits" in df.columns:
            selected_culprit_info = df[df["Culprits"] == culprit]["Culprit_Info"].values[0]

            # Store the clicked culprit's details in session state
            st.session_state.selected_culprit = culprit
            st.session_state.selected_culprit_info = selected_culprit_info
        else:
            st.error("Error retrieving culprit info.")

def display_page_3():
    st.markdown("### Step 2")
    st.title("🐍 The Conspirators")
    
    st.info("Who’s behind it? Every conspiracy theory needs a sinister group of scheming culprits.")
    st.write("Click on a culprit to see the summary below:")

    # Custom CSS for full-width buttons
    st.markdown("""
    <style>
        .stButton>button {
            width: 100%;
        }
    </style>
    """, unsafe_allow_html=True)
    
    
    #culprits_df = load_google_sheets_data("culprits")    
    random_culprits_df = get_random_culprits()
    
    # Check if the DataFrame is empty
    if random_culprits_df.empty:
        st.warning("No culprits to display.")
        return  # Exit the function early

    image_width = 200  # Adjust this value to your desired width
    image_height = 200  # Adjust this value to your desired height

    for i in range(0, len(random_culprits_df), 3):  # step of 3
        subset = random_culprits_df.iloc[i:i+3]
        cols = st.columns(3)
        for j, (index, row) in enumerate(subset.iterrows()):
            display_image_link(cols[j], row["Culprits"], row["Culprit_Image_URL"], image_width, image_height)

    # Add the reload button
    if st.button("Load New Culprits"):
        if "culprits_list" in st.session_state:
            del st.session_state.culprits_list
        st.cache_data.clear()  # Clear the cache
        st.experimental_rerun()  # Rerun the app

    # Displaying the selected culprit and its info if it exists in session state
    if "selected_culprit" in st.session_state and "selected_culprit_info" in st.session_state:
        st.subheader(f"Conspirator: {st.session_state.selected_culprit}")
        st.write(st.session_state.selected_culprit_info)

    # USER INPUT SECTION
    user_input = st.text_input("Please paste your culprit here and hit Enter:")
    if user_input:
        st.session_state.user_input = user_input  # Store the user input in session state
        st.write(f"You entered: {user_input}")


        # Store the pasted culprit in session state
        st.session_state.selected_culprit = None
        st.session_state.selected_culprit = user_input

    


    


















        


