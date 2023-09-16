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

from ct_gen.src.modules.initialize_session_state import initalize_session_state_dict
from ct_gen.src.modules.google_sheets_api import load_google_sheets_data


# def display_page_4():
    
#     st.markdown("### Page 4")
#     st.warning('DISCLAIMER: False conspiracy theories can be harmful. Please use our Conspiracy Generator with caution and do not target vulnerable groups of individuals.', icon="⚠️")
#     st.title("💡 The Motive")
    
    
#     col_1, col_2 = st.columns(2)
#     with col_1:
#         st.info("Who’s behind it? Every conspiracy theory needs a sinister group of scheming culprits.")
    
#     df = load_google_sheets_data()
    
#     with col_2:
#         selected_version = st.selectbox("Select a Motive:", df["Goals"])
    
#     if selected_version:
#         selected_motive_info = df.loc[df["Goals"] == selected_version, "Goals_Info"].values[0]
        
        
        
#         st.subheader("Motive Info") #Goal/Motive Infor
#         st.write(selected_motive_info)
        
#         # Store the selected content in session state
#         st.session_state.motives = selected_version
#         st.session_state.motive_info = selected_motive_info

@st.cache_data(ttl=3600)
def get_random_motives():
    if "motives_list" not in st.session_state:
        df = load_google_sheets_data()

        if df is None or df.empty:
            st.error("Failed to load motives data from Google Sheets.")
            return pd.DataFrame()  # Return an empty DataFrame

        st.session_state.motives_list = df.sample(3)  # sample 3 motives

    return st.session_state.motives_list

def display_image_link(column, motive, Motive_image_url, image_width, image_height):
    link_id = motive.replace(" ", "_")
    

    # Display the image with a button underneath
    image_html = f'''
    <div style="width: {image_width}px; height: {image_height}px;">
        <img src="{Motive_image_url}" alt="{motive}" width="{image_width}" height="{image_height}" style="border: 1px solid #eee; padding: 5px;">
    </div>
    '''
    column.markdown(image_html, unsafe_allow_html=True)

    # Use Streamlit button for interactions
    if column.button(f"Select {motive}"):
        # Capture the clicked motive's details
        df = load_google_sheets_data()
        if df is not None and "Goals" in df.columns:
            selected_motive_info = df[df["Goals"] == motive]["Goals_Info"].values[0]

            # Store the clicked motive's details in session state
            st.session_state.selected_motive = motive
            st.session_state.selected_motive_info = selected_motive_info
        else:
            st.error("Error retrieving motive info.")

def display_page_4():
    st.markdown("### Step 3")
    #st.warning('DISCLAIMER: False conspiracy theories can be harmful. Please use our Conspiracy Generator with caution and do not target vulnerable groups of individuals.', icon="⚠️")
    st.title("💡 The Motive")
    
    st.info("What's their endgame? Every conspiracy theory has a motive.")
    st.write("Click on a motive to see the summary below:")

    # Custom CSS for full-width buttons
    st.markdown("""
    <style>
        .stButton>button {
            width: 100%;
        }
    </style>
    """, unsafe_allow_html=True)
    
    random_motives_df = get_random_motives()

    # Check if the DataFrame is empty
    if random_motives_df.empty:
        st.warning("No culprits to display.")
        return  # Exit the function early

    image_width = 200  # Adjust this value to your desired width
    image_height = 200  # Adjust this value to your desired height

    for i in range(0, len(random_motives_df), 3):  # step of 3
        subset = random_motives_df.iloc[i:i+3]
        cols = st.columns(3)
        for j, (index, row) in enumerate(subset.iterrows()):
            display_image_link(cols[j], row["Goals"], row["Goals_Image_URL"], image_width, image_height)

    if st.button("Reload New Motives"):
        if "motives_list" in st.session_state:
            del st.session_state.motives_list

        st.cache_data.clear()  # Clear the cache
        st.experimental_rerun()  # Rerun the app

    # Displaying the selected motive and its info if it exists in session state
    if "selected_motive" in st.session_state and "selected_motive_info" in st.session_state:
        st.subheader(f"Motive: {st.session_state.selected_motive}")
        st.write(st.session_state.selected_motive_info)

