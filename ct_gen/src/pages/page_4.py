import streamlit as st
import base64
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



# @st.cache_data(ttl=3600, show_spinner=False)
# def get_random_motives():
#     if "motives_list" not in st.session_state:
#         df = load_google_sheets_data("goals")

#         if df is None or df.empty:
#             st.error("Failed to load motives data from Google Sheets.")
#             return pd.DataFrame()  # Return an empty DataFrame

#         st.session_state.motives_list = df.sample(3)  # sample 3 motives

#     return st.session_state.motives_list

# def get_random_motives_new(df):
#     #st.session_state.culprits_list = df.sample(3)  # sample 3 culprits
#     return df.sample(3)  # sample 3 culprits

# def display_image_link(column, motive, Motive_image_url, image_width, image_height):
#     link_id = motive.replace(" ", "_")
    

#     # Display the image with a button underneath
#     image_html = f'''
#     <div style="width: {image_width}px; height: {image_height}px;">
#         <img src="{Motive_image_url}" alt="{motive}" width="{image_width}" height="{image_height}" style="border: 1px solid #eee; padding: 5px;">
#     </div>
#     '''
#     column.markdown(image_html, unsafe_allow_html=True)

#     # Use Streamlit button for interactions
#     if column.button(f"{motive}"):
#         # Capture the clicked motive's details
#         df = load_google_sheets_data("goals")
#         if df is not None and "Goals" in df.columns:
#             selected_motive_info = df[df["Goals"] == motive]["Goals_Info"].values[0]

#             # Store the clicked motive's details in session state
#             st.session_state.selected_motive = motive
#             st.session_state.selected_motive_info = selected_motive_info
#         else:
#             st.error("Error retrieving motive info.")

# def display_page_4():
#     st.markdown("### Step 3")
    
#     st.title("💡 The Motive")
    
#     st.info("What's their endgame? Every conspiracy theory has a motive.")
#     st.write("Click on a motive to see the summary below:")

#     # Custom CSS for full-width buttons
#     st.markdown("""
#     <style>
#         .stButton>button {
#             width: 100%;
#         }
#     </style>
#     """, unsafe_allow_html=True)
    
#     random_motives_df = get_random_motives()

#     # Check if the DataFrame is empty
#     if random_motives_df.empty:
#         st.warning("No culprits to display.")
#         return  # Exit the function early

#     image_width = 200  # Adjust this value to your desired width
#     image_height = 200  # Adjust this value to your desired height

#     for i in range(0, len(random_motives_df), 3):  # step of 3
#         subset = random_motives_df.iloc[i:i+3]
#         cols = st.columns(3)
#         for j, (index, row) in enumerate(subset.iterrows()):
#             display_image_link(cols[j], row["Goals"], row["Goals_Image_URL"], image_width, image_height)

#     if st.button("Reload New Motives"):
#         if "motives_list" in st.session_state:
#             del st.session_state.motives_list

#         st.cache_data.clear()  # Clear the cache
#         st.experimental_rerun()  # Rerun the app

#     # Displaying the selected motive and its info if it exists in session state
#     if "selected_motive" in st.session_state and "selected_motive_info" in st.session_state:
#         st.subheader(f"Motive: {st.session_state.selected_motive}")
#         st.write(st.session_state.selected_motive_info)


#     # USER INPUT SECTION
#     user_input = st.text_input("Please paste your motive here and hit Enter:")
#     if user_input:
#         st.session_state.user_input = user_input  # Store the user input in session state
#         st.write(f"You entered: {user_input}")


#     # Store the pasted culprit in session state
#     st.session_state.motives_list = None
#     st.session_state.motives_list = user_input

def image_to_base64(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

@st.cache_data(ttl=3600, show_spinner=False)
def get_random_motives():
    image_dir = "ct_gen/data/images/motives"
    all_image_names = os.listdir(image_dir)
    motives = random.sample(all_image_names, 3) if len(all_image_names) >= 3 else all_image_names
    return motives

def display_image_link(column, motive, image_path, image_width, image_height):
    base64_image = image_to_base64(image_path)
    image_html = f'''
    <div style="width: {image_width}px; height: {image_height}px;">
        <img src="data:image/png;base64,{base64_image}" alt="{motive}" width="{image_width}" height="{image_height}" style="border: 1px solid #eee; padding: 5px;">
    </div>
    '''
    column.markdown(image_html, unsafe_allow_html=True)

    if column.button(motive):
        df = load_google_sheets_data("goals")
        if df is not None and "Goals" in df.columns:
            selected_motive_rows = df[df["Goals"] == motive]
            
            if not selected_motive_rows.empty:
                selected_motive_info = selected_motive_rows["Goals_Info"].values[0]

                # Store the clicked motive's details in session state
                st.session_state.selected_motive = motive
                st.session_state.selected_motive_info = selected_motive_info

                st.subheader(f"Motive: {st.session_state.selected_motive}")
                st.write(st.session_state.selected_motive_info)
            else:
                st.error(f"No information found for {motive}.")
        else:
            st.error("Error retrieving motive info.")

def display_page_4():
    st.markdown("### Step 2")
    st.title("🐍 The Motive")
    
    st.info("What's their endgame? Every conspiracy theory has a motive.")
    st.write("Click on a motive to see the summary below:")
    
    st.markdown("""
    <style>
        .stButton>button {
            width: 100%;
        }
    </style>
    """, unsafe_allow_html=True)
    
    random_motives = get_random_motives()
    
    if not random_motives:
        st.warning("No motives to display.")
        return  # Exit the function early

    image_width = 225
    image_height = 225

    for i in range(0, len(random_motives), 3):
        subset = random_motives[i:i+3]
        cols = st.columns(3)
        for j, motive_name in enumerate(subset):
            image_path = os.path.join("ct_gen/data/images/motives", motive_name)
            display_image_link(cols[j], motive_name.split('.')[0], image_path, image_width, image_height)

    # Add the reload button
    if st.button("Load New Motive"):
        if "motives_list" in st.session_state:
            del st.session_state.motives_list
        st.cache_data.clear()  # Clear the cache
        st.experimental_rerun()  # Rerun the app

    # USER INPUT SECTION
    user_input = st.text_input("Please paste your motive here and hit Enter:")
    if user_input:
        st.session_state.user_input = user_input  # Store the user input in session state
        st.write(f"You entered: {user_input}")
        st.session_state.motives_list = None
        st.session_state.motives_list = user_input