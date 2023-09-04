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



# @st.cache_data(ttl=3600)
# def get_random_culprits():
#     df = load_google_sheets_data()
#     random_culprits = df["Culprits"].sample(3).tolist()
#     return random_culprits

# def display_page_3():
#     st.markdown("### Page 3")
#     st.warning('DISCLAIMER: False conspiracy theories can be harmful. Please use our Conspiracy Generator with caution and do not target vulnerable groups of individuals.', icon="⚠️")
#     st.title("🐍 The Conspirators")
    
#     st.info("Who’s behind it? Every conspiracy theory needs a sinister group of scheming culprits.")
    
#     random_culprits = get_random_culprits()

#     st.markdown("""
#     <style>
#         .stButton>button {
#             width: 100%;
#         }
#     </style>
#     """, unsafe_allow_html=True)

#     for culprit in random_culprits:
#         if st.button(culprit):
#             df = load_google_sheets_data()
#             selected_culprit_info = df.loc[df["Culprits"] == culprit, "Culprit_Info"].values[0]
            
#             st.subheader("Conspirator Info")
#             st.markdown(selected_culprit_info)
            
#             # Store the selected content in session state
#             st.session_state.selected_culprit = culprit
#             st.session_state.selected_culprit_info = selected_culprit_info


#     if st.button("Reload New Culprits"):
#         st.cache_data.clear()  # Clear the cache
#         st.experimental_rerun()  # Rerun the app

###############
###############
# @st.cache_data(ttl=3600)
# def get_random_culprits():
#     df = load_google_sheets_data()
#     random_culprits = df["Culprits"].drop_duplicates().sample(3).tolist()  # Ensuring unique culprits
#     return random_culprits

# def display_page_3():
#     st.markdown("### Page 3")
#     st.warning('DISCLAIMER: False conspiracy theories can be harmful. Please use our Conspiracy Generator with caution and do not target vulnerable groups of individuals.', icon="⚠️")
#     st.title("🐍 The Conspirators")
    
#     st.info("Who’s behind it? Every conspiracy theory needs a sinister group of scheming culprits.")

#     # Custom CSS for full-width buttons
#     st.markdown("""
#     <style>
#         .stButton>button {
#             width: 100%;
#         }
#     </style>
#     """, unsafe_allow_html=True)
    
#     # Display the random culprits as buttons
#     random_culprits = get_random_culprits()
#     for culprit in random_culprits:
#         if st.button(culprit):
#             df = load_google_sheets_data()
#             selected_culprit_info = df.loc[df["Culprits"] == culprit, "Culprit_Info"].values[0]
            
#             # Store the selected content in session state
#             st.session_state.selected_culprit = culprit
#             st.session_state.selected_culprit_info = selected_culprit_info

#     if st.button("Reload New Culprits"):
#         st.cache_data.clear()  # Clear the cache
#         st.experimental_rerun()  # Rerun the app

#     # Display content from the selected culprit
#     if hasattr(st.session_state, 'selected_culprit_info'):
#         st.subheader("Culprit Information")
#         st.write(st.session_state.selected_culprit_info)
#         # Optional: You can also display a link or more details if you have them.

##########
##########

# @st.cache_data(ttl=3600)
# def get_random_culprits():
#     df = load_google_sheets_data()
#     return df.sample(6)  # sample 6 culprits

# def display_image_link(column, culprit, image_url, image_width, image_height):
#     link_id = culprit.replace(" ", "_")  # Create a simple ID
#     image_html = f'''
#     <a href="?clicked={link_id}">
#         <img src="{image_url}" alt="{culprit}" width="{image_width}" height="{image_height}" style="border:1px solid #eee;padding:5px;">
#     </a>
#     '''
#     column.markdown(image_html, unsafe_allow_html=True)
    
#     # Check if this link was clicked
#     params = st.experimental_get_query_params()
#     if params.get("clicked") == [link_id]:
#         df = load_google_sheets_data()
#         selected_culprit_info = df.loc[df["Culprits"] == culprit, "Culprit_Info"].values[0]
        
#         st.subheader("Conspirator Info")
#         st.markdown(selected_culprit_info)
        
#         # Store the selected content in session state
#         st.session_state.selected_culprit = culprit
#         st.session_state.selected_culprit_info = selected_culprit_info

# def display_page_3():
#     st.markdown("### Page 3")
#     st.warning('DISCLAIMER: False conspiracy theories can be harmful. Please use our Conspiracy Generator with caution and do not target vulnerable groups of individuals.', icon="⚠️")
#     st.title("🐍 The Conspirators")
    
#     st.info("Who’s behind it? Every conspiracy theory needs a sinister group of scheming culprits.")
    
#     random_culprits_df = get_random_culprits()

#     image_width = 200  # Adjust this value to your desired width
#     image_height = 200  # Adjust this value to your desired height

#     for i in range(0, len(random_culprits_df), 3):  # step of 3
#         subset = random_culprits_df.iloc[i:i+3]
#         cols = st.columns(3)
#         for j, (index, row) in enumerate(subset.iterrows()):
#             display_image_link(cols[j], row["Culprits"], row["Image_URL"], image_width, image_height)

#     if st.button("Reload New Culprits"):
#         st.cache_data.clear()  # Clear the cache
#         st.experimental_rerun()  # Rerun the app

######
######

@st.cache_data(ttl=3600)
def get_random_culprits():
    if "culprits_list" not in st.session_state:
        df = load_google_sheets_data()

        if df is None or df.empty:
            st.error("Failed to load culprits data from Google Sheets.")
            return pd.DataFrame()  # Return an empty DataFrame

        st.session_state.culprits_list = df.sample(6)  # sample 6 culprits

    return st.session_state.culprits_list

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
    if column.button(f"Select {culprit}"):
        # Capture the clicked culprit's details
        df = load_google_sheets_data()
        if df is not None and "Culprits" in df.columns:
            selected_culprit_info = df[df["Culprits"] == culprit]["Culprit_Info"].values[0]

            # Store the clicked culprit's details in session state
            st.session_state.selected_culprit = culprit
            st.session_state.selected_culprit_info = selected_culprit_info
        else:
            st.error("Error retrieving culprit info.")

def display_page_3():
    st.markdown("### Page 3")
    st.warning('DISCLAIMER: False conspiracy theories can be harmful. Please use our Conspiracy Generator with caution and do not target vulnerable groups of individuals.', icon="⚠️")
    st.title("🐍 The Conspirators")
    
    st.info("Who’s behind it? Every conspiracy theory needs a sinister group of scheming culprits.")

    # Custom CSS for full-width buttons
    st.markdown("""
    <style>
        .stButton>button {
            width: 100%;
        }
    </style>
    """, unsafe_allow_html=True)
    
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
            display_image_link(cols[j], row["Culprits"], row["Image_URL"], image_width, image_height)

    if st.button("Reload New Culprits"):
        if "culprits_list" in st.session_state:
            del st.session_state.culprits_list

        st.cache_data.clear()  # Clear the cache
        st.experimental_rerun()  # Rerun the app

    # Displaying the selected culprit and its info if it exists in session state
    if "selected_culprit" in st.session_state and "selected_culprit_info" in st.session_state:
        st.subheader(f"Conspirator: {st.session_state.selected_culprit}")
        st.write(st.session_state.selected_culprit_info)


















        


