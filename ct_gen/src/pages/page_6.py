import streamlit as st
import datetime
import gspread
#from gsheetsdb import connect
import shillelagh
import sqlite3
import base64
import newspaper
from oauth2client.service_account import ServiceAccountCredentials
from oauth2client import service_account
import os
import openai
import pandas as pd
import random
import requests
#from streamlit_extras.badges import badge
import time
import sys
import webbrowser
#from googleapiclient.discovery import build

from ct_gen.src.modules.initialize_session_state import initalize_session_state_dict 

# Access the Google Sheets API credentials from st.secrets
google_sheets_credentials = st.secrets["gcp_service_account"]

# Set up Google Sheets API credentials
scope = ['https://spreadsheets.google.com/feeds', 'https://www.googleapis.com/auth/drive']
creds = ServiceAccountCredentials.from_json_keyfile_dict(google_sheets_credentials, scope)
client = gspread.authorize(creds)


# Generate CT function
def generate_conspiracy_theory(selected_article_content, culprits, goals, motive_info):
    # Access the user inputs from the session state
    url = st.session_state.url

    # Partial prompts from each step
    partial_prompts = [
        f"Connecting the dots...\n- Find inconsistencies in the timeline.\n- Highlight contradictions in witness statements.",
        f"Dealing with counterevidence...\n- Connect unconnected events to create intrigue.\n- Associate the culprits with unusual symbols.",
        f"Refuting counterevidence...\n- Label counterevidence as part of a larger cover-up.\n- Propose that evidence was planted to confuse.",
        f"Discrediting critics...\n- Label critics as government shills.\n- Suggest critics are manipulated by hidden powers."
    ]

    
    # Set up your prompt for generating the conspiracy theory
    main_prompt = f"Generate a conspiracy theory involving {culprits} and their goal to {goals}. " \
             f"They have orchestrated the creation of the official version as a cover-up for their evil plans, which says: '{selected_article_content}'. " \
             f"Their motive behind this conspiracy is to {motive_info}. " \
             "The truth is hidden and only those who 'wake up' can see it. [GENERATE GT]"
    
     
    
# Create messages in conversation format
    messages = [{"role": "system", "content": "You are a helpful assistant."}]
    for prompt in partial_prompts:
        messages.append({"role": "user", "content": prompt})
    messages.append({"role": "user", "content": main_prompt})

    
    try:
        # Try to generate the conspiracy theory using GPT-4
        with st.spinner('Generating your conspiracy theory with GPT-4. This usually takes about 20-30 seconds.'):
            response = openai.ChatCompletion.create(
                model="gpt-4",
                messages=messages,
                temperature=0.2
                
            )
        conspiracy_theory = response.choices[-1].message['content'].strip()


    except Exception as e:
        # If GPT-4 throws an error, fall back to GPT-3
        st.warning(f"An error occurred with GPT-4: {str(e)}. Falling back to GPT-3.")
        with st.spinner('Generating your conspiracy theory with GPT-3...'):
            response = openai.Completion.create(
                model="gpt-3.5",
                messages=messages,
                temperature=0.2
            )

        conspiracy_theory = response.choices[-1].message['content'].strip()

      
    return conspiracy_theory



def generate_theory_title_and_subtitle(selected_article_content, culprits, goals, motive_info):
    """Generate a title and subtitle for the conspiracy theory using GPT-4 based on the provided inputs."""
    
    # Generate Title
    title_prompt = f"Provide a catchy title for a conspiracy theory that involves {culprits}, whose goal is {goals} and is driven by the motive to {motive_info}. Based on the article: '{selected_article_content[:100]}...'."
    
    try:
        with st.spinner('Generating a title for your conspiracy theory with GPT-4.'):
            response = openai.ChatCompletion.create(
                model="gpt-4",
                messages=[{"role": "user", "content": title_prompt}]
            )
        title = response.choices[0].message['content'].strip().replace("\"", "")  # Removing any speech marks from the title
    except Exception as e:
        st.warning(f"An error occurred with GPT-4 while generating title: {str(e)}. Falling back to a default title.")
        title = "The Hidden Truth Revealed"

    # Generate Subtitle
    subtitle_prompt = f"Provide a succinct one-sentence subtitle of about 20 words without using a colon for a conspiracy theory that involves {culprits}, whose goal is {goals} and is driven by the motive to {motive_info}. Based on the article: '{selected_article_content[:100]}...'."
    
    try:
        with st.spinner('Generating a subtitle for your conspiracy theory with GPT-4.'):
            response = openai.ChatCompletion.create(
                model="gpt-4",
                messages=[{"role": "user", "content": subtitle_prompt}]
            )
        subtitle = response.choices[0].message['content'].strip().replace("\"", "").replace(":", "")  # Removing any speech marks and colons
    except Exception as e:
        st.warning(f"An error occurred with GPT-4 while generating subtitle: {str(e)}. Falling back to a default subtitle.")
        subtitle = "Diving Deep into Secrets, Lies, and Unveiling Hidden Truths"

    return title, subtitle

# Append data to Google sheet
def append_to_sheet(title, subtitle, conspiracy_theory, culprits, motive_info):
    # Current timestamp
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    try:
        sheet = client.open('Generated_stories').worksheet('ct-stories')
        row = [title, subtitle, conspiracy_theory, culprits, motive_info, timestamp]
        sheet.append_row(row)
        st.success("Successfully added to the Google Sheet!")
    except Exception as e:
        st.error(f"Failed to add to the Google Sheet. Error: {str(e)}")

# Display page
def display_page_6():
    
    
    #st.warning('DISCLAIMER: False conspiracy theories can be harmful. Please use our Conspiracy Generator with caution and do not target vulnerable groups or individuals.', icon="⚠️")
    st.title("🔦 Your Conspiracy Theory")

    # Create the selected parameters message as a single string
    message = """
    ### You selected the following ingredients for your CT:
    **Story:** {}\n
    **Culprit:** {}\n
    **Motive:** {}\n
    """.format(st.session_state.selected_article_content[:100] + "...", 
               st.session_state.selected_culprit, 
               st.session_state.selected_motive_info)

    # Display the message inside an info box
    st.info(message)
    

    #st.divider()
    generation_button = st.button("Generate your theory!")
    
    theory_title = "The Hidden Truth Revealed"  # default value
    theory_subtitle = "Unmasking Hidden Agendas"  # default subtitle value
    

    try:
        if generation_button:
            conspiracy_theory = generate_conspiracy_theory(
                st.session_state.selected_article_content,
                st.session_state.selected_culprit,
                st.session_state.goals,
                st.session_state.motive_info
            )
            st.session_state.conspiracy_theory = conspiracy_theory
           
            
            theory_title, theory_subtitle = generate_theory_title_and_subtitle(
                st.session_state.selected_article_content,
                st.session_state.selected_culprit,
                st.session_state.goals,
                st.session_state.motive_info
            )

        
            # "Type" the conspiracy theory letter by letter
            #st.info("Here is your conspiracy theory.")
            st.subheader(theory_title)  # Display the generated title
            st.markdown(f"**{theory_subtitle}**")  # Display the generated subtitle in smaller bold font
            typed_output = ""
            placeholder = st.empty()
            for char in conspiracy_theory:
                typed_output += char
                placeholder.markdown(f'{typed_output}')
                time.sleep(0.01)  # Adjust the sleep duration for faster or slower typing effect

            ...
            # Check if the conspiracy theory was generated successfully
            if conspiracy_theory:
                # Retrieve culprits and goals from session state
                culprits = st.session_state.selected_culprit
                motive_info = st.session_state.selected_motive_info
                # If generated, attempt to add to Google Sheet
                append_to_sheet(conspiracy_theory, theory_title, theory_subtitle, culprits, motive_info)
            else:
                # If not generated, display an error message
                st.error("Failed to generate the conspiracy theory. Please try again.")
            
                 
        
        def image_to_base64(image_path):
            with open(image_path, "rb") as image_file:
                return base64.b64encode(image_file.read()).decode('utf-8')
    
            # Check if selected_motive_image_path exists in session state
        if "selected_motive_image_path" in st.session_state:
            # Convert the image at the path to base64 for embedding
            base64_image = image_to_base64(st.session_state.selected_motive_image_path)
            # Set desired image width and height
            image_width = "100%"
            
            # Create an HTML block to display the image
            image_html = f'''
            <div style="width: {image_width}px; margin: 10px 0;">
                <img src="data:image/png;base64,{base64_image}" alt="Selected Motive Image" width="{image_width}" style="border: 1px solid #eee; padding: 5px;">
            </div>
            '''
            # Use markdown to display the image
            st.markdown(image_html, unsafe_allow_html=True)   


    except AttributeError:
        st.warning("It seems you haven't selected a story, conspirator, or motive. Please go back and make your selections.")

    # Custom CSS for full-width buttons
    st.markdown("""
    <style>
        .stButton>button {
            width: 100%;
        }
    </style>
    """, unsafe_allow_html=True)

    